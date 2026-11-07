export interface Service {
  id: string
  name: string
  description: string
  price: string
  duration: string
  category: string
  icon: string
  popular?: boolean
}

export interface Barber {
  id: string
  name: string
  role: string
  bio: string
  image: string
  specialties: string[]
  instagram?: string
}

export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
}

export interface Review {
  id: string
  author: string
  rating: number
  text: string
  date: string
  service?: string
  avatar?: string
}

export const services: Service[] = [
  {
    id: 'corte-cabelo',
    name: 'Corte de Cabelo',
    description: 'Corte personalizado com tesoura e/ou máquina, lavagem e finalização incluídas.',
    price: '15€ - 25€',
    duration: '30-45 min',
    category: 'Cabelo',
    icon: 'scissors',
    popular: true,
  },
  {
    id: 'fade-cut',
    name: 'Fade Cut',
    description: 'Degradé preciso e moderno (low, mid, high fade) com acabamento navalha.',
    price: '20€',
    duration: '40 min',
    category: 'Cabelo',
    icon: 'scissors',
    popular: true,
  },
  {
    id: 'barba-completa',
    name: 'Barba Completa',
    description: 'Aparar, modelar, toalha quente, óleo e bálsamo hidratante.',
    price: '12€',
    duration: '30 min',
    category: 'Barba',
    icon: 'scissors',
    popular: true,
  },
  {
    id: 'barba-simples',
    name: 'Barba Simples',
    description: 'Aparar e modelar a barba com acabamento navalha.',
    price: '8€',
    duration: '20 min',
    category: 'Barba',
    icon: 'scissors',
  },
  {
    id: 'navalha-quente',
    name: 'Barbear Navalha Quente',
    description: 'Barbear tradicional com toalha quente, espuma, navalha e pós-barba.',
    price: '15€',
    duration: '35 min',
    category: 'Barba',
    icon: 'scissors',
    popular: true,
  },
  {
    id: 'corte-barba',
    name: 'Corte + Barba',
    description: 'Combo completo: corte de cabelo + barba completa com toalha quente.',
    price: '25€',
    duration: '60 min',
    category: 'Combos',
    icon: 'scissors',
    popular: true,
  },
  {
    id: 'corte-crianca',
    name: 'Corte Criança (até 12 anos)',
    description: 'Corte adaptado para crianças com paciência e diversão.',
    price: '12€',
    duration: '30 min',
    category: 'Cabelo',
    icon: 'scissors',
  },
  {
    id: 'corte-militar',
    name: 'Corte Militar',
    description: 'Corte curto e preciso estilo militar (buzz cut, regulation cut).',
    price: '15€',
    duration: '25 min',
    category: 'Cabelo',
    icon: 'scissors',
  },
  {
    id: 'colocacao-cor',
    name: 'Coloração Cabelo',
    description: 'Coloração profissional, mechas ou cobrir brancos.',
    price: '25€ - 40€',
    duration: '60-90 min',
    category: 'Tratamentos',
    icon: 'scissors',
  },
  {
    id: 'sobrancelha',
    name: 'Aparar Sobrancelha',
    description: 'Modelagem de sobrancelha com pinça/navalha e hidratação.',
    price: '5€',
    duration: '10 min',
    category: 'Rosto',
    icon: 'scissors',
  },
  {
    id: 'lavagem-hidratacao',
    name: 'Lavagem + Hidratação',
    description: 'Lavagem profunda com champô adequado e máscara hidratante.',
    price: '8€',
    duration: '20 min',
    category: 'Tratamentos',
    icon: 'scissors',
  },
  {
    id: 'tratamento-barba',
    name: 'Tratamento Barba Premium',
    description: 'Esfoliação, máscara, toalha quente, óleo premium e modelagem.',
    price: '18€',
    duration: '40 min',
    category: 'Barba',
    icon: 'scissors',
  },
  {
    id: 'cabelo-cacheado',
    name: 'Corte Cabelo Cacheado',
    description: 'Corte especializado para cabelos cacheados (técnica curly cut).',
    price: '25€',
    duration: '45 min',
    category: 'Cabelo',
    icon: 'scissors',
  },
  {
    id: 'cabelo-longo',
    name: 'Corte Cabelo Longo',
    description: 'Corte e modelagem para cabelos longos (tesoura, camadas, textura).',
    price: '20€',
    duration: '40 min',
    category: 'Cabelo',
    icon: 'scissors',
  },
  {
    id: 'rapado',
    name: 'Rapado Total (Máquina)',
    description: 'Corte à máquina uniforme (grade 0 a 3) - rápido e prático.',
    price: '10€',
    duration: '15 min',
    category: 'Cabelo',
    icon: 'scissors',
  },
]

export const barbers: Barber[] = [
  {
    id: 'barber-1',
    name: 'Nuno',
    role: 'Fundador & Barbeiro Master',
    bio: 'Com mais de 15 anos de experiência, o Nuno fundou a KingsStudio 2020 para trazer a verdadeira arte da barbearia clássica com toque moderno a Queluz. Especialista em fades, navalha e coloração.',
    image: 'https://lh3.googleusercontent.com/p/AF1QipMxBarberNuno=w400-h400',
    specialties: ['Fade Cut', 'Navalha Quente', 'Coloração', 'Barba Premium'],
    instagram: '@nuno_barber_master',
  },
  {
    id: 'barber-2',
    name: 'Ruben',
    role: 'Barbeiro Senior',
    bio: 'Especialista em cortes modernos e tendências atuais. Domina técnicas de texturização, cortes tesoura e styling. Atendimento personalizado para cada tipo de cabelo.',
    image: 'https://lh3.googleusercontent.com/p/AF1QipMxBarberRuben=w400-h400',
    specialties: ['Corte Tesoura', 'Texturização', 'Cabelo Cacheado', 'Styling'],
    instagram: '@ruben_cuts',
  },
  {
    id: 'barber-3',
    name: 'Bruno',
    role: 'Barbeiro',
    bio: 'Focado em barbearia clássica e cortes masculinos tradicionais. Mão leve na navalha e atenção ao detalhe. Ótimo com primeiros cortes e crianças.',
    image: 'https://lh3.googleusercontent.com/p/AF1QipMxBarberBruno=w400-h400',
    specialties: ['Corte Clássico', 'Navalha', 'Crianças', 'Barba Tradicional'],
    instagram: '@bruno_barber',
  },
  {
    id: 'barber-4',
    name: 'Vitor',
    role: 'Barbeiro',
    bio: 'Especialista em barbearia moderna e tendências atuais. Domina técnicas de fades precisos, coloração e tratamentos de barba premium.',
    image: 'https://lh3.googleusercontent.com/p/AF1QipMxBarberVitor=w400-h400',
    specialties: ['Fade Cut', 'Coloração', 'Barba Premium', 'Tratamentos'],
    instagram: '@vitor_barber',
  },
]

export const galleryImages: GalleryImage[] = [
  {
    id: 'gallery-1',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryInterior1=w800-h600',
    alt: 'Interior da barbearia KingsStudio 2020 - zona de corte',
    category: 'Interior',
  },
  {
    id: 'gallery-2',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryInterior2=w800-h600',
    alt: 'Interior da barbearia - zona de espera e receção',
    category: 'Interior',
  },
  {
    id: 'gallery-3',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryBarber1=w800-h600',
    alt: 'Barbeiro a fazer fade cut',
    category: 'Trabalhos',
  },
  {
    id: 'gallery-4',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryBarber2=w800-h600',
    alt: 'Barbear navalha quente tradicional',
    category: 'Trabalhos',
  },
  {
    id: 'gallery-5',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryBarber3=w800-h600',
    alt: 'Corte e styling cabelo cacheado',
    category: 'Trabalhos',
  },
  {
    id: 'gallery-6',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryDetail1=w800-h600',
    alt: 'Detalhe das ferramentas e produtos premium',
    category: 'Detalhes',
  },
  {
    id: 'gallery-7',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryDetail2=w800-h600',
    alt: 'Produtos de barba e cabelo disponíveis',
    category: 'Detalhes',
  },
  {
    id: 'gallery-8',
    src: 'https://lh3.googleusercontent.com/p/AF1QipMxGalleryExterior=w800-h600',
    alt: 'Exterior da barbearia KingsStudio 2020',
    category: 'Exterior',
  },
]

export const reviews: Review[] = [
  {
    id: 'review-1',
    author: 'João Silva',
    rating: 5,
    text: 'Melhor barbearia de Queluz sem dúvida! O King é um artista, fez-me um fade perfeito. Ambiente top, staff super simpático. Recomendo a 100%.',
    date: '2 semanas atrás',
    service: 'Fade Cut',
  },
  {
    id: 'review-2',
    author: 'Miguel Santos',
    rating: 5,
    text: 'Fui fazer a barba com navalha quente e foi uma experiência incrível. Toalha quente, produtos de qualidade, atenção ao detalhe. Voltarei de certeza.',
    date: '1 mês atrás',
    service: 'Navalha Quente',
  },
  {
    id: 'review-3',
    author: 'Pedro Costa',
    rating: 5,
    text: 'Levei o meu filho de 8 anos para o primeiro corte e o Miguel teve uma paciência incrível. Saiu feliz com o corte. Profissionais de verdade.',
    date: '3 semanas atrás',
    service: 'Corte Criança',
  },
  {
    id: 'review-4',
    author: 'André Ferreira',
    rating: 5,
    text: 'Faço o combo corte + barba há mais de 2 anos. Consistência impecável, preço justo, ambiente masculino como deve ser. A minha barbearia de eleição.',
    date: '1 semana atrás',
    service: 'Corte + Barba',
  },
  {
    id: 'review-5',
    author: 'Rui Martins',
    rating: 4,
    text: 'Bom corte, preço honesto. O espaço é giro e bem decorado. Única coisa: às vezes tem espera, mas vale a pena. Agendamento online ajuda muito.',
    date: '2 meses atrás',
    service: 'Corte de Cabelo',
  },
  {
    id: 'review-6',
    author: 'Tiago Lopes',
    rating: 5,
    text: 'Fiz coloração para cobrir brancos e ficou super natural. Ninguém nota que pintei, acham que é o meu cabelo natural. Produtos bons, recomendo.',
    date: '1 mês atrás',
    service: 'Coloração',
  },
]