import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui";

const featuredArtists = [
  { name: "Aanya Sharma", role: "Kathak Dancer", tags: ["Performance", "Workshop"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Y82wjWdUTg8xJDlBH-sWIGHom3yZ_6xpFS27Ip3siiv3W1vXWZXN47P0V5xPiSU6gUfNTZgKJG1sunxQSvSJn4mIoT9zQ4jtIb4-ILz07bHwBMkFDGcuc2FBjTK9wXrb9fZ0ON8HO7no2VxYYiAMUiwtdQHkkCrEmAnsRBJ_40kmTGKcPXQafLYWQ1x43mcWhnx6-tRE65WtP1-5uxaue1D4QOGMeH7nsLUyih-n3ykPSe792Nr9m2gOIOGYj90nzD1XVhMS-h57" },
  { name: "Rajesh Kumar", role: "Master Potter", tags: ["Custom Orders"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCI2Jt7XQAT7j9hj-NyZhe9cUaF61Xzaye5XF6zhMSxiR_O8qECwym-CEqLTO1w9g-H1btbShtpVOSfAsoGvj74zaU3y4nAPEnA2gkq5j-Hv2l66XEEQnOMJ6ezkhfO-DvmlFAzxl8cYtMkK43hvXE6T6hAVpqPm8HkE9ZSFnQ-veoidpV-BZnMYtYXXcl9egO1OXg2EB0HubiwUJkPPYGDe2PnZpUWHjRFOCTwlJDsbfmK9WoEl5k0N6CxIFP7sfOjAJ_nuDVAWdst" },
  { name: "Lakshmi Devi", role: "Handloom Weaver", tags: ["Textiles"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAAZlkRXRLjVl2-XoMfw35aW0czQcUprhr6UnfoDc-kf88s1RO7R26pV8VD_juAMBr1jgr8T9Cj1V3RaLLy34BEX236aSl3gRAyxaaAzjJt82-HPBTOqRlOSRIJ30R5di95wtn3-Afxpen1TdTvx1TIbmkB22yJ-hbV6dEwoD4GIb6h8uIxmlkqofTUczTUHxzStPK3vaXSTK4zeblNj3HeZgRq9lcnTIHXXER18D3UN-arRpF0DbVF1n7Y_YFF_0mAXyP-e5d1dMae" },
  { name: "Vikram Singh", role: "Sitar Maestro", tags: ["Live Events"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuClzPGoZy9fFQy05Iql5waG45D6bZdn7HVFAFPJdtdkv25lhHgG9isnQZQ7IcFGIKRM83T47k54-g2XAJxHBfmAipOXJu6DWP17djaUWGYka3DBsr4tghRckUJLbGChbvDPgV0ya9WB-zTbFpXcMrXpQk6-kzVkAfnAxdqnQbw3Ldoncp6ZxRRNXtgy1YfEzql3IjnbQolg8dOSwGgo7GMYzOwBugRT_E-HbCDB2RVlId4dZb61xDZlvxTuK_5X8EpZMZgliPbI-RFm" },
  { name: "Priya Art", role: "Madhubani Painter", tags: ["Commissions"], img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC3HMGZS14n3jPnvsGrxqlQlnQdiLaM-CEsgvMR0azSmYfMkx2PzH7dyJTYTlGcS_-I30TfS9-GtVpNEOfxI5PMCsCANJTFoK8ZlHPthDbk0kMrX3a7ac_oeLG-jzpPgw7LjaJEOfo18g7xHzJb_QW9HS08Xre_pi2gFBDTANd2TpCRJY2peRNx9YmU4YWTW3tpJdsVj1m8ruiiEuAmPgh2uq-jGBCtlgwnquakvUW3wCvpqhGrf-uLe7dM4MO4inPUcmX-CDNJC_pF" },
];

const upcomingEvents = [
  { date: "15", month: "Oct", category: "Classical Music", title: "Evening of Ragas: Sitar & Tabla Duet", location: "Ravindra Bhavan, Delhi", description: "Experience the mesmerizing interplay of melody and rhythm with masters of Indian classical music.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM098LhbtG3A352o0mHLfumDK0EmILxOyjnDjRr3Ohtp4zceSgyMSUHwIsWvVv_YF3LNPZjfvYd5VfL6sReUkuUpCBivoPzflj-QusYU_wFrJg6nDUUoOi4ju6SCj4e6s1kOw2rxxtJnPsTvc0fm6uFuVFglUOxuFszTRvINFBjVpqjRl1HWso8NGMIqWwHXgYz8dv7mEd-fxbBw8p_SEUcBcsHpQbSLYZbKMq2xvcfhPzb864UnyytOzfjMZNKUO28DZJL30UnMoL", attendees: 42 },
  { date: "22", month: "Nov", category: "Folk Dance", title: "Rajasthan Heritage Festival", location: "Cultural Centre, Jaipur", description: "A vibrant showcase of Ghoomar, Kalbelia, and other traditional folk dances of the desert state.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcApLifRJJ8UEEvRrnMSu2MasdkoAs0HSxzxeXcf-xEgDFBRfbo9mI3QnL8rFYbvshdAJvzXeNAccVIQudomsSVQi1bOQd2Fr5dPhg8UnZ85qvYj09c2IeW46apVPHwQhk3scGvWtFx7jFQfMnXC2bb_BWelYtcQY9NqQWG2EkYOBxsY-Smj2RDLmRXiBxrZHBbN6G26DGSjDbfdDUWlSG3M6CUCCe0QrxvPml1hM3NbZeljzaUFjzfq_h8Wvwo7a_smR_mo-RY-s-", attendees: 120 },
  { date: "05", month: "Dec", category: "Exhibition", title: "Threads of Tradition: Silk Expo", location: "Art Gallery, Mumbai", description: "Discover the finest handwoven silks from Varanasi, Kanchipuram, and Mysore.", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBX2iqwMGqxI8dOvR-g_FRwdMgcCZvM488-9aJHNbYD7kqFtChdNoWs954vlxUGH0ElbycKYsGTY_3-O1ENtXKCqX_t5KzY-0O1VBCWeYaaDXmBrENwO6f1zD01JMEX3-ViHDyXqgHrRhaSOu8mmw3nooxd1vx5cBje1NKWA6hdEGE-ya9Mn20-0LH5iY-9tpEzrGhGe1zNSfFOwZnrtuSLPr2n0oZgIGEkw1rmiHJuS7N8iywpaMQQyJW06IHJrKCPRKqPewdPUyB_", attendees: 85 },
];

const products = [
  { category: "Pottery", name: "Terracotta Water Pitcher", price: "₹1,200", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAZcGjGqNKXE6azI_ZUwN1uIkb4QhdgQV34aVgj8YGiMaTckkpItdTz1CG2OFKLV0kn1IC3EWvvHjw19efe7Z9GkZOy3-v74DRhabra5lY6e6Ww0ZDjeEm0E9bwWiPI7DOCpJasHEtOP5eBk3czPLn3_EAkg9fTqvgSm6ostg3HY8AlZlimoR731IHwRLdj_7bGUmm07mT95xmjiRnR8uMNDxe7TefdM8kDpcZrgGcN9KHKib78C2kpY5zg98xdDGLmXaLPehz5-69" },
  { category: "Textile", name: "Embroidered Tote", price: "₹2,450", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA02ZJuHQ25XB1BQPVjWjOACWpuzMcZiCBLpy3LeVu0aq832O-gZ7FmA7UdFYqyHN3zcyg9WwfmZ01qZP6pWXt0LYKolcPiqVOW4KYT5MAL9wjc4bxt3AtLRdzbN7BbIqGreFg2XpLwdeNngqFtJ6BSVN7zn1L5VRp_xcAVbiyqgtL9h3CGi2UvRFoMG_fzL17inqRiMbBXnLnmABPMPwZif3AvnL7DCON93PntNFa1wVN2M4RRjq0aYRWfK4RkHhu5gRAKUXNsy7P6" },
  { category: "Woodwork", name: "Sandalwood Figurine", price: "₹3,800", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCk9_b8iOJI-pypNLZ-5YVTh1uPLKklr39ChatpSfC7BrQkPk1ZIfQNNgyvSJFmdUZhGxMmVd2S0Dyscb9hhqipVjEMcHuHz_qLD-4FKqqzokjh4qEm1xNs6qutKANWMqIXCWTM6Pc5ePmK8Ot7MUfYxdp4NqM5ImXglAl_JgHs8N7nbY_ocyv-0-fRvnIEAi6qJj77gkJbhNsfBV6kLymz2xgynweMO6JGedpHv5USLFIA1c865se_TKV_DTVJwMyA1BTUcO8HvMAL" },
  { category: "Jewelry", name: "Silver Jhumka Earrings", price: "₹1,850", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2a6kZtPGVYwreRvIWLgMDoOUqiGOWyVlmkX_B0exrNKCNChGhvQ22X7XjpYYITNVKA3DQKB2Fp-EWoWEjZGzfpsndglQvJhViPrbMffLSiO5IhIk06bNjf9rEIIdvfZLlTlM_cNdzmXN9QMv1Zjeyv8WkXy6Gpdu3pr85lr60cFLmsmc1lovLtrPlRt0SoIUQMe_hVaMLrqy6m8LBiHx3Vp118_m01_5O9XVXf4L1f9RV9To5oUmQ1_-A9NIOJZRdcJpkdWAx0BUF" },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <section className="relative bg-[var(--deep-teal)] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1590610994348-1b2c4c015d38?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 text-left mb-12 md:mb-0 z-10 animate-fade-in-up">
            <div className="inline-block px-4 py-1 mb-4 rounded-full bg-[var(--terracotta)]/20 text-[var(--sand)] border border-[var(--terracotta)]/30 font-semibold text-sm tracking-wide">
              BRIDGING TRADITION & TECHNOLOGY
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--cream)] leading-tight mb-6 font-display">
              Preserve Heritage, <br />
              <span className="text-[var(--sand)]">Create Future.</span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--cream)]/80 mb-8 max-w-lg leading-relaxed">
              The premier platform connecting traditional artists, craftspeople, and organizers. Find work, sell crafts, and fund your cultural legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="bg-[var(--terracotta)] text-white px-8 py-3 rounded-full hover:bg-[#d06a4e] transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2">
                <span>Join as Artist</span>
                <span className="material-symbols-outlined text-sm">brush</span>
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-[var(--sand)] text-[var(--sand)] px-8 py-3 rounded-full hover:bg-[var(--sand)] hover:text-[var(--deep-teal)] transition-all duration-300 font-bold flex items-center justify-center gap-2">
                <span>I&apos;m an Organizer</span>
                <span className="material-symbols-outlined text-sm">event_seat</span>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative h-[500px] hidden md:block">
            <div className="absolute top-0 right-0 w-80 h-96 bg-cover bg-center rounded-t-full shadow-2xl border-4 border-[var(--cream)]/10 z-10 transform translate-x-4" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515664177431-7b3b4f971295?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')" }}></div>
            <div className="absolute bottom-10 right-40 w-64 h-64 bg-cover bg-center rounded-full shadow-2xl border-4 border-[var(--terracotta)] z-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1629215089308-41719c628e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')" }}></div>
            <div className="absolute top-20 right-60 w-32 h-32 bg-[var(--sand)] rounded-full mix-blend-multiply opacity-80 blur-xl"></div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full leading-none text-[var(--cream)]">
          <svg className="block w-full h-16 md:h-24" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,250.7C960,235,1056,181,1152,165.3C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="currentColor" fillOpacity="1"></path>
          </svg>
        </div>
      </section>

      <section className="py-20 bg-[var(--cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[var(--deep-teal)] mb-2 font-display">Featured Artisans</h2>
              <p className="text-[var(--terracotta)] font-medium">Masters of their craft, preserving history.</p>
            </div>
            <Link className="hidden sm:flex items-center text-[var(--deep-teal)] font-bold hover:text-[var(--terracotta)] transition-colors" href="/discover">
              View All Artists <span className="material-symbols-outlined ml-1">arrow_forward</span>
            </Link>
          </div>
          <div className="masonry-grid">
            {featuredArtists.map((artist, i) => (
              <div key={i} className="masonry-item relative group overflow-hidden rounded-2xl cursor-pointer card-shadow">
                <Image
                  alt={artist.role}
                  className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500"
                  src={artist.img}
                  width={900}
                  height={1200}
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-teal)]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white text-xl font-bold font-display">{artist.name}</h3>
                  <p className="text-[var(--sand)] text-sm mb-2">{artist.role}</p>
                  <div className="flex gap-2">
                    {artist.tags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs text-white">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#EAE7DC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[var(--terracotta)] font-bold tracking-wider uppercase text-sm">Experience Culture</span>
            <h2 className="text-4xl font-bold text-[var(--deep-teal)] mt-2 font-display">Upcoming Cultural Events</h2>
            <div className="w-20 h-1 bg-[var(--terracotta)] mx-auto mt-4 rounded-full"></div>
          </div>
          <div className="grid gap-6">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row h-auto md:h-56">
                <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden">
                  <Image
                    alt={event.title}
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                    src={event.img}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                  <div className="absolute top-4 left-4 bg-[var(--terracotta)] text-white px-3 py-1 rounded-lg text-center shadow-lg">
                    <span className="block text-xl font-bold leading-none">{event.date}</span>
                    <span className="text-xs uppercase font-medium">{event.month}</span>
                  </div>
                </div>
                <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-between relative">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[var(--terracotta)] font-semibold text-sm mb-2 block uppercase tracking-wide">{event.category}</span>
                      <span className="text-gray-400 text-sm flex items-center"><span className="material-symbols-outlined text-base mr-1">location_on</span> {event.location}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--deep-teal)] mb-2 font-display group-hover:text-[var(--terracotta)] transition-colors">{event.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">+{event.attendees}</div>
                    </div>
                    <Link href="/opportunities" className="bg-[var(--deep-teal)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[var(--terracotta)] transition-colors shadow-md flex items-center gap-2">
                      Book Ticket <span className="material-symbols-outlined text-sm">confirmation_number</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link className="inline-flex items-center text-[var(--deep-teal)] font-bold hover:text-[var(--terracotta)] transition-colors border-b-2 border-transparent hover:border-[var(--terracotta)] pb-1" href="/opportunities">
              View Full Calendar <span className="material-symbols-outlined ml-1">calendar_month</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[var(--deep-teal)] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-bold text-[var(--cream)] font-display">KalaSetu Bazaar</h2>
              <p className="text-[var(--sand)] mt-2 text-lg">Direct from the hands of the creator to your home.</p>
            </div>
            <Link className="mt-4 md:mt-0 text-[var(--cream)] border border-[var(--cream)] px-6 py-2 rounded-full hover:bg-[var(--cream)] hover:text-[var(--deep-teal)] transition-all font-medium" href="/marketplace">
              Explore Marketplace
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-2xl group transition-transform hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image
                    alt={product.name}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    src={product.img}
                    fill
                    sizes="(max-width: 1024px) 100vw, 25vw"
                    unoptimized
                  />
                  <div className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-[var(--terracotta)] cursor-pointer hover:bg-red-50">
                    <span className="material-symbols-outlined text-xl">favorite</span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</div>
                  <h3 className="text-lg font-bold text-[var(--deep-teal)] mb-2 font-display">{product.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-bold text-[var(--terracotta)]">{product.price}</span>
                    <Button className="bg-[var(--deep-teal)] text-white p-2 rounded-lg hover:bg-[var(--terracotta)] transition-colors">
                      <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}