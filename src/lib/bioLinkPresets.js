import {
  Link as LinkIcon, MessageCircle, Instagram, Music2, Youtube,
  ShoppingBag, Briefcase, Mail, Phone, Headphones, Linkedin, Twitter
} from 'lucide-react';

export const BIO_LINK_PRESETS = {
  link:      { label: 'Link',       icon: LinkIcon,       hint: 'https://...' },
  whatsapp:  { label: 'WhatsApp',   icon: MessageCircle,  hint: 'https://wa.me/55119...' },
  instagram: { label: 'Instagram',  icon: Instagram,      hint: 'https://instagram.com/...' },
  tiktok:    { label: 'TikTok',     icon: Music2,         hint: 'https://tiktok.com/@...' },
  youtube:   { label: 'YouTube',    icon: Youtube,        hint: 'https://youtube.com/@...' },
  store:     { label: 'Loja',       icon: ShoppingBag,    hint: 'https://sualoja.com' },
  portfolio: { label: 'Portfólio',  icon: Briefcase,      hint: 'https://seuportfolio.com' },
  email:     { label: 'E-mail',     icon: Mail,           hint: 'mailto:voce@email.com' },
  phone:     { label: 'Telefone',   icon: Phone,          hint: 'tel:+5511999999999' },
  spotify:   { label: 'Spotify',    icon: Headphones,     hint: 'https://open.spotify.com/...' },
  linkedin:  { label: 'LinkedIn',   icon: Linkedin,       hint: 'https://linkedin.com/in/...' },
  twitter:   { label: 'X / Twitter',icon: Twitter,        hint: 'https://x.com/...' },
};

export const getBioLinkMeta = (type) => BIO_LINK_PRESETS[type] || BIO_LINK_PRESETS.link;