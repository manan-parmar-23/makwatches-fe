import { Mail, Phone, MapPin, Building2 } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;re here to assist you with your timepiece needs. Reach out
            to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Contact Methods */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    Phone
                  </h3>
                  <a
                    href="tel:9974959693"
                    className="text-gray-600 hover:text-amber-600 transition-colors font-medium"
                  >
                    +91 9974959693
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    Email
                  </h3>
                  <a
                    href="mailto:makwatches2303@gmail.com"
                    className="text-gray-600 hover:text-amber-600 transition-colors break-all font-medium"
                  >
                    makwatches2303@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-black">
                    Legal Entity
                  </h3>
                  <p className="text-gray-600 font-medium">MAK WATCHES</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-amber-200 rounded-lg p-8 hover:border-amber-500 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-black">
                    Address
                  </h3>
                  <div className="text-gray-600 space-y-1 font-medium">
                    <p>Shree Ganesh Watch</p>
                    <p>Matwa Street</p>
                    <p>Near Balaji Cineplex</p>
                    <p>Jetpur, Rajkot</p>
                    <p>Gujarat - 360370</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
