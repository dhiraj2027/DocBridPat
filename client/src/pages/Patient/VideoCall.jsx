import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { getVideoRoom } from '../../services/videoService.js'
import Button from '../../components/ui/Button.jsx'
import Spinner from '../../components/ui/Spinner.jsx'


// ICE servers (STUN)
const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
}



const VideoCall = () => {
    const { appointmentId } = useParams()
    const navigate = useNavigate()

    // Refs
    const localVideoRef = useRef(null)
    const remoteVideoRef = useRef(null)
    const peerConnectionRef = useRef(null)
    const socketRef = useRef(null)
    const localStreamRef = useRef(null)

    // State
    const [roomId, setRoomId] = useState('')
    const [isLoadingRoom, setIsLoadingRoom] = useState(true)
    const [roomError, setRoomError] = useState('')

    const [callStatus, setCallStatus] = useState('connecting')
    // connecting | waiting | in-call | ended

    const [isMicOn, setIsMicOn] = useState(true)
    const [isCameraOn, setIsCameraOn] = useState(true)
    const [isRemoteConnected, setIsRemoteConnected] = useState(false)
    const [callDuration, setCallDuration] = useState(0)
    const durationRef = useRef(null)


    // Start call duration timer when in-call
    useEffect(() => {
        if(callStatus === 'in-call') {
            durationRef.current = setInterval(() => {
                setCallDuration(prev => prev+1)
            }, 1000)
        } else {
            clearInterval(durationRef.current)
        }

        return () => clearInterval(durationRef.current)
    }, [callStatus])

    const formatDuration = (secs) => {
        const m = String(Math.floor(secs / 60)).padStart(2, '0')
        const s = String(secs % 60).padStart(2, '0')

        return `${m}:${s}`
    }


    // Step 1: Fetch room id from backend
    useEffect(() => {
        const fetchRoom = async () => {
            setIsLoadingRoom(true)

            try {
                
                const data = await getVideoRoom(appointmentId)
                setRoomId(data.roomId)

            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to get video room.'
                setRoomError(message)
            } finally {
                setIsLoadingRoom(false)
            }
        }

        fetchRoom()
    }, [appointmentId])


    // Step 2: Start camera + join room
    useEffect(() => {
        if(!roomId) return

        let cleanupCalled = false

        const startCall = async () => {
            try {
                
                // Get local media stream (camera + mic)
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                })

                localStreamRef.current = stream

                // show own video in local video element
                if(localVideoRef.current) {
                    localVideoRef.current.srcObject = stream
                }

                const token = localStorage.getItem('token')
                // connecting to signaling server
                socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                    transports: ['websocket'],
                    auth: { token }
                })

                socketRef.current.on('connect', () => {
                    // join the room using our roomId
                    socketRef.current.emit('join-room', roomId)
                    setCallStatus('waiting')
                })

                // When other peer joins
                socketRef.current.on('peer-joined', async () => {
                    setIsRemoteConnected(true)
                    setCallStatus('in-call')

                    // Create peer connection
                    createPeerConnection(stream)

                    // Create and send offer
                    const offer = await peerConnectionRef.current.createOffer()
                    await peerConnectionRef.current.setLocalDescription(offer)

                    socketRef.current.emit('offer', { roomId, offer })
                })

                // When we receive an offer
                socketRef.current.on('offer', async ({ offer }) => {
                    setIsRemoteConnected(true)
                    setCallStatus('in-call')

                    createPeerConnection(stream)

                    await peerConnectionRef.current.setRemoteDescription(
                        new RTCSessionDescription(offer)
                    )

                    // Create and send answer
                    const answer = await peerConnectionRef.current.createAnswer()
                    await peerConnectionRef.current.setLocalDescription(answer)

                    socketRef.current.emit('answer', { roomId, answer })
                })

                // When we receive an answer
                socketRef.current.on('answer', async ({ answer }) => {
                    await peerConnectionRef.current?.setRemoteDescription(
                        new RTCSessionDescription(answer)
                    )
                })

                // When we receive ICE candidate
                socketRef.current.on('ice-candidate', async ({ candidate }) => {
                    try {
                        
                        await peerConnectionRef.current?.addIceCandidate(
                            new RTCIceCandidate(candidate)
                        )

                    } catch {
                        // Ignoring ICE errors
                    }
                })

                // When other peer leaves
                socketRef.current.on('peer-left', () => {
                    setIsRemoteConnected(false)
                    setCallStatus('ended')

                    if(remoteVideoRef.current) {
                        remoteVideoRef.current.srcObject = null
                    }
                })
                
            } catch (err) {
                if(!cleanupCalled) {
                    setRoomError(
                        'Could not access camera/microphone. ' + 
                        'Please allow permissions and try again.'
                    )
                }
            }
        }

        startCall()

        // Cleanup when component unmounts
        return () => {
            cleanupCalled = true
            cleanup()
        }
    }, [roomId])


    // Create RTCPeerConnection
    const createPeerConnection = useCallback((stream) => {
        const pc = new RTCPeerConnection(ICE_SERVERS)

        // Add all local tracks to peer connection
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream)
        })

        // When ICE candidate is found, send to other peer
        pc.onicecandidate = (event) => {
            if(event.candidate) {
                socketRef.current?.emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate
                })
            }
        }

        // When remote track arrives, show in remote video
        pc.ontrack = (event) => {
            if(remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0]
            }
        }

        // Connection state changes
        pc.onconnectionstatechange = () => {
            if(pc.connectionState==='disconnected' || pc.connectionState==='failed') {
                setIsRemoteConnected(false)
                setCallStatus('ended')
            }
        }

        peerConnectionRef.current = pc
    }, [roomId])


    // Cleanup all connections
    const cleanup = () => {
        // Stop all local media tracks
        localStreamRef.current?.getTracks().forEach((t) => t.stop())

        // Close peer connection
        peerConnectionRef.current?.close()

        // Disconnect socket and leave room
        if(socketRef.current) {
            socketRef.current.emit('leave-room', roomId)
            socketRef.current.disconnect()
        }
    }

    // Toggle mic
    const toggleMic = () => {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0]

        if(audioTrack) {
            audioTrack.enabled = !audioTrack.enabled
            setIsMicOn(audioTrack.enabled)
        }
    }

    // Toggle camera
    const toggleCamera = () => {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0]

        if(videoTrack) {
            videoTrack.enabled = !videoTrack.enabled
            setIsCameraOn(videoTrack.enabled)
        }
    }


    // End call
    const handleEndCall = () => {
        cleanup()
        setCallStatus('ended')
    }

    // Leave and navigate back
    const handleLeave = () => {
        navigate('/doctor/appointments', { replace: true })
    }

    // Loading screen
    if(isLoadingRoom) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Spinner 
                        size='lg'
                        className="border-blue-500 border-t-transparent mx-auto"
                    />

                    <p className="text-gray-400 text-sm">Setting up your consultation room...</p>
                </div>
            </div>
        )
    }


    // Error screen
    if(roomError) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
                    <div className="w-14 h-14 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                        <svg
                            className="w-7 h-7 text-red-400"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M12 9v2m0 4h.01m-6.938 
                                    4h13.856c1.54 0 2.502-1.667 
                                    1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 
                                    0L3.34 16c-.77 1.333.192 3 1.732 3z'
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-1">
                            Unable to join call
                        </h2>
                        <p className="text-gray-400 text-sm">{roomError}</p>
                    </div>

                    <Button onClick={handleLeave} className="w-full">
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }


    // Call ended screen
    if(callStatus === 'ended') {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
                    <div className="w-14 h-14 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center mx-auto">
                        <svg
                            className="w-7 h-7 text-gray-400"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M16 8l2-2m0 0l2-2m-2 
                                    2l-2-2m2 2l2 2M5 3a2 2 
                                    0 00-2 2v1c0 8.284 6.716 
                                    15 15 15h1a2 2 0 002-2v-3.28a1 
                                    1 0 00-.684-.948l-4.493-1.498a1 
                                    1 0 00-1.21.502l-1.13 2.257a11.042 
                                    11.042 0 01-5.516-5.517l2.257-1.128a1 
                                    1 0 00.502-1.21L9.228 3.683A1 
                                    1 0 008.279 3H5z'
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-1">
                            Call Ended
                        </h2>
                        <p className="text-gray-400 text-sm">
                            {callDuration > 0
                                ? `Duration: ${formatDuration(callDuration)}` 
                                : 'The video consultation has ended.'
                            }
                        </p>
                    </div>
                    <Button onClick={handleLeave}>
                        Back to Appointments
                    </Button>
                </div>
            </div>
        )
    }


    // Main video call UI
    return (
        <div className="h-[100dvh] w-full bg-gray-950 flex flex-col overflow-hidden">
            
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">D</span>
                    </div>

                    <span className="text-white font-semibold">DocBridPat</span>
                </div>

                {/* Call status indicator */}
                <div className="flex items-center gap-2">
                    <div className={`
                        w-2 h-2 rounded-full 
                        ${callStatus === 'in-call' 
                            ? 'bg-green-400 animate-pulse'
                            : 'bg-yellow-400 animate-pulse'
                        }
                    `} />
                    <span className="text-sm text-gray-300">
                        {callStatus === 'in-call' 
                            ? `Connected · ${formatDuration(callDuration)}`
                            : 'Waiting for participant...'
                        }
                    </span>
                </div>

                {/* Room id badge */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="text-xs text-gray-500">Room:</span>
                    <span className="text-xs text-gray-300 font-mono">
                        {roomId.slice(0, 8)}...
                    </span>
                </div>
            </div>

            {/* Video area */}
            <div className="flex-1 relative p-3 min-h-0">
                
                {/* Remote video (full screen) */}
                <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 relative">
                    <video 
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Waiting overlay when remote not connected */}
                    {!isRemoteConnected && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D0F14]">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center ring-1 ring-white/10 shadow-2xl">
                                    <svg
                                        className="w-10 h-10 text-gray-600"
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d='M16 7a4 4 0 11-8 0 4 4 0 
                                                018 0zM12 14a7 7 0 00-7 
                                                7h14a7 7 0 00-7-7z'
                                        />
                                    </svg>
                                </div>

                                <span className="absolute inset-0 rounded-full ring-1 ring-blue-500/20 animate-ping" />
                            </div>
                            <p className="text-gray-200 text-base font-medium tracking-wide">
                                Waiting for other participant...
                            </p>
                            <p className="text-gray-600 text-xs mt-2 tracking-wide">
                                They will appear here once they join
                            </p>
                        </div>
                    )}
                </div>

                {/* Local video (picture-in-picture) */}
                <div className="absolute bottom-7 right-7 w-36 sm:w-48 aspect-video bg-gray-800 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                    <video 
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`
                            w-full h-full object-cover 
                            ${!isCameraOn ? 'hidden' : ''}    
                        `}
                    />

                    {!isCameraOn && (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 text-gray-500"
                                    fill='none'
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d='M16 7a4 4 0 11-8 0 4 4 0 
                                            018 0zM12 14a7 7 0 00-7 
                                            7h14a7 7 0 00-7-7z'
                                    />
                                </svg>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-1.5 left-0 right-0 text-center">
                        <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded-full">
                            You
                        </span>
                    </div>
                </div>

            </div>

            {/* Controls bar */}
            <div className="bg-gray-900 border-t border-gray-800 px-6 py-4">
                <div className="flex items-center justify-center gap-3">

                    {/* Mic toggle */}
                    <button
                        onClick={toggleMic}
                        className={`
                            w-12 h-12 rounded-full flex items-center justify-center 
                            transition-all duration-150 
                            ${isMicOn 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }
                        `}
                        title={isMicOn ? 'Mute mic' : 'Unmute mic'}
                    >
                        {isMicOn ? (
                            <svg
                                className="w-5 h-5"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M19 11a7 7 0 01-7 7m0 
                                        0a7 7 0 01-7-7m7 7v4m0 
                                        0H8m4 0h4m-4-8a3 3 0 
                                        01-3-3V5a3 3 0 116 0v6a3 
                                        3 0 01-3 3z'
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M5.586 15H4a1 1 0 01-1-1v-4a1 
                                        1 0 011-1h1.586l4.707-4.707C10.923 
                                        3.663 12 4.109 12 5v14c0 
                                        .891-1.077 1.337-1.707.707L5.586 15z'
                                />
                            </svg>
                        )}
                    </button>


                    {/* Camera toggle */}
                    <button
                        onClick={toggleCamera}
                        className={`
                            w-12 h-12 rounded-full flex items-center justify-center 
                            transition-all duration-150 
                            ${isCameraOn 
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }
                        `}
                        title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isCameraOn ? (
                            <svg
                                className="w-5 h-5"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M15 10l4.553-2.069A1 1 0 
                                        0121 8.82v6.36a1 1 0 
                                        01-1.447.894L15 14M5 18h8a2 
                                        2 0 002-2V8a2 2 0 
                                        00-2-2H5a2 2 0 00-2 
                                        2v8a2 2 0 002 2z'
                                />
                            </svg>
                        ) : (
                            <svg
                                className="w-5 h-5"
                                fill='none'
                                stroke='currentColor'
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d='M18.364 18.364A9 9 0 
                                        005.636 5.636m12.728 12.728A9 
                                        9 0 015.636 5.636m12.728 
                                        12.728L5.636 5.636'
                                />
                            </svg>
                        )}
                    </button>


                    {/* End call */}
                    <button
                        onClick={handleEndCall}
                        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-150 shadow-lg mx-2"
                        title="End call"
                    >
                        <svg
                            className="w-6 h-6"
                            fill='none'
                            stroke='currentColor'
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d='M16 8l2-2m0 0l2-2m-2 
                                    2l-2-2m2 2l2 2M5 3a2 2 
                                    0 00-2 2v1c0 8.284 6.716 
                                    15 15 15h1a2 2 0 002-2v-3.28a1 
                                    1 0 00-.684-.948l-4.493-1.498a1 
                                    1 0 00-1.21.502l-1.13 2.257a11.042 
                                    11.042 0 01-5.516-5.517l2.257-1.128a1 
                                    1 0 00.502-1.21L9.228 3.683A1 
                                    1 0 008.279 3H5z'
                            />
                        </svg>
                    </button>

                </div>

                {/* Status text */}
                <p className="text-center text-xs text-gray-600 mt-3">
                    {callStatus === 'in-call' 
                        ? 'End-to-end encrypted via webRTC'
                        : 'Waiting for the other participant to join...'
                    }
                </p>
            </div>
            
        </div>
    )
}

export default VideoCall