import { Link } from "react-router-dom"
import Button from "../components/ui/Button"

const Home = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Hero Section */}
            <section className="py-20 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                    Book Doctor Appointments <br />
                    <span className="text-blue-600">Fast & easy</span>
                </h1>
                <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                    Connect with verified doctors, book appointments online,
                    and attend video consultations from the comfort of your home.
                </p>

                <div className="flex items-center justify-center gap-4">
                    <Link to='/register'>
                        <Button size='lg'>Get Started Free</Button>
                    </Link>
                    <Link to='/doctors'>
                        <Button size='lg' variant='outline'>Browse Doctors</Button>
                    </Link>
                </div>
            </section>


            {/* How It Works */}
            <section className="py-16 border-t border-gray-100">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    How It Works
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            step: '01',
                            title: 'Create Account',
                            description: 'Sign up as a patient or doctor in minutes with just your email.'
                        },
                        {
                            step: '02',
                            title: 'Find a Doctor',
                            description: 'Browse verified doctors by specialization and view available slots.'
                        },
                        {
                            step: '03',
                            title: 'Book & Consult',
                            description: 'Book an appointment and attend a video call from anywhere.'
                        }
                    ].map((item) => (
                        <div
                            key={item.step}
                            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                                {item.step}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                            <p className="text-gray-500 text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>
            </section>


            {/* Specialization */}
            <section className="py-16 border-t border-gray-100">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Our Specializations
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[
                        'General Physician',
                        'Cardiologist',
                        'Dermatologist',
                        'Neurologist',
                        'Pediatrician',
                        'Psychiatrist',
                        'Orthopedic',
                        'Dentist',
                        'Gynecologist',
                        'Ophthalmologist',
                        'ENT Specialist',
                        'Urologist'
                    ].map((spec) => (
                        <Link
                            key={spec}
                            to={`/doctors?specialization=${spec}`}
                            className="flex items-center justify-center p-4 bg-white border
                            border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400
                            hover:text-blue-600 hover:shadow-sm transition-all"
                        >
                            {spec}
                        </Link>
                    ))}
                </div>
            </section>


            {/* CTA Section */}
            <section className="py-16 border-t border-gray-100 text-center">
                <div className="bg-blue-600 rounded-3xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">
                        Are You a Doctor?
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                        Join our platform, set your availability, and start consulting
                        patients online through secure video calls.
                    </p>
                    <Link to='/register'>
                        <Button
                            variant='secondary'
                            size='lg'
                        >
                            Join as Doctor
                        </Button>
                    </Link>
                </div>
            </section>

        </div>
    )
}

export default Home