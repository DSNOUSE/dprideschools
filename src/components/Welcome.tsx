import Image from "next/image";



interface WelcomeProps {

  message?: string;

  name?: string;

}



export default function Welcome({ message, name }: WelcomeProps) {

  const displayName = name || 'Maryam Salihu Mohammed';

  

  return (

    <section id="about" className="relative bg-blue-50 pt-16 md:pt-24 pb-0 flex flex-col overflow-hidden border-t-[6px] border-blue-600">

      {/* Background decoration */}

      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl" />

      {/* Large transparent background text */}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[6rem] md:text-[10rem] lg:text-[24rem] font-bold text-blue-300/10 transform -rotate-2 whitespace-nowrap leading-none">
          DPRIDE<br/> INTERNATIONAL<br/> SCHOOL
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-auto relative z-10">

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Message - Left Column */}

          <div className="max-w-2xl pb-12">

            <div className="">

              <div className="flex items-center gap-3 mb-6">
                <Image 
                  src="/images/title-img.svg" 
                  alt="" 
                  width={24}
                  height={24}
                  className="w-6 h-6"
                  aria-hidden="true"
                />
                <span className="inline-block py-2 text-md font-semibold">
                  Welcome to
                </span>
              </div>

            </div>

            

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">

            DPRIDE INTERNATIONAL SCHOOL

            </h2>



            <div className="space-y-4">
              {(message || '').split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-lg text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <p className="text-lg font-semibold text-gray-900 mt-6">
              {displayName}
            </p>
            <p className="text-base text-gray-600 mt-1">
              Director
            </p>



          </div>

          

          {/* Director Image - Right Column */}

          <div className="flex items-start md:items-end justify-center md:justify-end overflow-hidden">

            <div className="w-[384px] sm:w-80 md:w-[480px] lg:w-[576px] max-h-72 md:max-h-none md:translate-y-0">

              <Image

                src="/images/director.png"

                alt={displayName}

                width={400}

                height={533}

                className="w-full h-auto object-contain"

                priority

              />

            </div>

          </div>

        </div>

      </div>

    </section>

  );

}