# KingsStudio 2020 - Barbearia em Queluz

Site moderno para a barbearia KingsStudio 2020 com agendamento online, galeria de fotos, avaliações e deploy na Vercel.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** para estilização
- **React Hook Form** + **Zod** para formulários
- **date-fns** para manipulação de datas
- **Lucide React** para ícones
- **Vercel** para deploy gratuito

## 📋 Funcionalidades

- ✅ Página inicial com hero, serviços, barbeiros, galeria, avaliações
- ✅ Agendamento online em 3 passos (serviço → data/hora → dados pessoais)
- ✅ Design responsivo (mobile-first)
- ✅ Modo escuro/claro automático
- ✅ Galeria com lightbox
- ✅ SEO otimizado (meta tags, Open Graph, sitemap)
- ✅ PWA ready (manifest, icons)
- ✅ API route para processar agendamentos
- ✅ Acessibilidade (ARIA, semantic HTML)

## 🛠️ Instalação Local

```bash
# Entrar na pasta do projeto
cd KingsStudio

# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🌐 Deploy na Vercel (Gratuito)

### Opção 1: Via GitHub (Recomendado)

1. **Crie um repositório no GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: KingsStudio 2020"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/kingsstudio.git
   git push -u origin main
   ```

2. **Conecte na Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New..." → "Project"
   - Importe o repositório GitHub
   - Clique em "Deploy"
   - Pronto! Seu site estará em `https://kingsstudio.vercel.app`

### Opção 2: Via Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Opção 3: Arraste e solte (Mais simples)

1. Faça `npm run build`
2. A pasta `.next` será criada
3. Acesse [vercel.com/new](https://vercel.com/new)
4. Arraste a pasta do projeto para a área de upload
5. Deploy automático!

## 📸 Adicionar Fotos Reais do Google

As imagens atuais são placeholders. Para usar fotos reais:

### Opção 1: Google Places API (Recomendado)
1. Ative a **Places API** no [Google Cloud Console](https://console.cloud.google.com)
2. Crie uma API Key
3. Adicione a variável de ambiente na Vercel:
   ```
   GOOGLE_PLACES_API_KEY=sua_chave_aqui
   GOOGLE_PLACE_ID=ChIJ... (Place ID da KingsStudio)
   ```

### Opção 2: Upload manual (Mais simples)
1. Baixe as fotos do Google Maps/Perfil da empresa
2. Coloque na pasta `public/images/`
3. Atualize `src/lib/data.ts` com os caminhos locais:
   ```typescript
   src: '/images/foto-interior-1.jpg',
   ```

### Opção 3: Google Maps Embed (Para o mapa)
O mapa já está configurado com iframe do Google Maps. Para personalizar:
1. Vá no [Google Maps](https://maps.google.com)
2. Busque "KingsStudio 2020 Queluz"
3. Clique em "Partilhar" → "Incorporar mapa"
4. Copie o `src` do iframe e atualize em `src/app/page.tsx`

## 🔧 Configurações Importantes

### Variáveis de Ambiente (Vercel Dashboard → Settings → Environment Variables)

```env
# Opcional - Para emails de confirmação
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=agendamentos@kingsstudio.pt

# Opcional - Para SMS
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+351915271491

# Opcional - Google Places para fotos reais
GOOGLE_PLACES_API_KEY=xxx
GOOGLE_PLACE_ID=ChIJxxx
```

### Domínio Personalizado (Opcional)
Se quiser usar `kingsstudio.pt` em vez de `kingsstudio.vercel.app`:
1. Compre o domínio (ex: Namecheap, GoDaddy, Google Domains)
2. Na Vercel: Settings → Domains → Add
3. Configure os DNS conforme instruções da Vercel

## 📁 Estrutura do Projeto

```
KingsStudio/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── icon-192.svg       # Icone PWA
│   └── icon-512.svg       # Icone PWA
├── src/
│   ├── app/
│   │   ├── api/bookings/  # API route para agendamentos
│   │   ├── globals.css    # Estilos globais + Tailwind
│   │   ├── layout.tsx     # Layout raiz + SEO
│   │   └── page.tsx       # Página principal
│   ├── components/
│   │   ├── Header.tsx     # Cabeçalho com navegação
│   │   ├── Footer.tsx     # Rodapé
│   │   ├── ServiceCard.tsx
│   │   ├── BarberCard.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── Gallery.tsx    # Galeria com lightbox
│   │   └── BookingModal.tsx  # Modal de agendamento (3 passos)
│   └── lib/
│       └── data.ts        # Dados: serviços, barbeiros, galeria, avaliações
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── vercel.json           # Configuração Vercel
```

## 🎨 Personalização

### Cores (tailwind.config.ts)
```typescript
colors: {
  primary: {
    500: '#d67433',  // Cor principal (laranja/âmbar)
    600: '#c55e25',  // Hover
    // ...
  }
}
```

### Fontes (layout.tsx)
- **Display**: Playfair Display (títulos)
- **Sans**: Inter (corpo do texto)

### Dados (src/lib/data.ts)
Edite os arrays `services`, `barbers`, `galleryImages`, `reviews` com seus dados reais.

## 📱 PWA - Instalar como App

O site é um PWA completo. Visitantes podem:
1. Abrir no Chrome/Edge/Safari mobile
2. Menu → "Instalar app" / "Adicionar à tela inicial"
3. Funciona offline (cache básico)

## 🔒 Segurança

- Headers de segurança no `next.config.js`
- Validação Zod no frontend e backend
- Sanitização de inputs
- CSP básico

## 📊 Analytics (Opcional)

Adicione no `layout.tsx`:
```tsx
// Google Analytics
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
/>
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-XXXXXXXXXX');
    `,
  }}
/>
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado - uso exclusivo da KingsStudio 2020.

## 📞 Suporte

- **Telefone**: 915 271 491
- **Email**: kingsstudio2020@gmail.com
- **Morada**: R. Jose Cipriano da Silveira Machado 9 G, 2745-200 Queluz

---

**Desenvolvido com ❤️ para a KingsStudio 2020**