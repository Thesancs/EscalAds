
'use client';
import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Image as ImageIcon,
  Loader2,
  Wifi,
  Signal,
  BatteryFull,
  ArrowLeft,
  Video,
  Phone,
  MoreVertical,
  Paperclip,
  Camera,
  Mic,
  Smile,
  Play,
  BatteryCharging,
  LocateIcon,
  Plane,
} from 'lucide-react';

export type MessageKind = 'text' | 'image' | 'audio';

export type ChatMessage = {
  id: string;
  sender: 'client' | 'me';
  kind?: MessageKind;
  text?: string;
  imageUrl?: string;
  audioLabel?: string;
  time?: string;
};

export type StatusBarOptions = {
  hideTop?: boolean;
  interfaceStyle?: 'android' | 'iphone';
  phoneTime?: string;
  showBackArrow?: boolean;
  showKeyboard?: boolean;
  icons?: {
    location?: boolean;
    networkLabel?: '3G' | '4G' | '5G' | 'LTE' | '';
    batteryPercent?: number;
    charging?: boolean;
    signalBars?: 0 | 1 | 2 | 3 | 4;
    wifi?: boolean;
    airplane?: boolean;
  };
};

export type ChatHeaderOptions = {
  name: string;
  status?: string;
  unreadCount?: string;
  profileUrl?: string | null;
};

export type WhatsAppLivePreviewProps = {
  options?: StatusBarOptions;
  header: ChatHeaderOptions;
  messages: ChatMessage[];
  loading?: boolean;
  error?: string | null;
  generatedImage?: string | null;
  className?: string;
  hideBottom?: boolean;
};

const DEFAULT_TIME = '08:42';
const DEFAULT_PHONE_TIME = '10:04';

const SignalBars = ({ bars = 4 }: { bars: number }) => {
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn('w-1 rounded-[1px] bg-white/90',
            i === 0 ? 'h-1.5' : '',
            i === 1 ? 'h-2' : '',
            i === 2 ? 'h-2.5' : '',
            i === 3 ? 'h-3' : '',
            i >= bars && 'opacity-30'
          )}
        />
      ))}
    </div>
  );
};


const StatusBar = ({ options }: { options: StatusBarOptions }) => {
  const { interfaceStyle = 'iphone', phoneTime = DEFAULT_PHONE_TIME, icons = {} } = options;
  const {
    networkLabel = 'LTE',
    batteryPercent = 80,
    charging = false,
    signalBars = 4,
    wifi = true,
    location = false,
    airplane = false,
  } = icons;

  if (options.hideTop) return null;

  if (interfaceStyle === 'android') {
    return (
      <div className="absolute top-0 left-0 right-0 h-8 px-4 flex items-center justify-end gap-2 text-white/90 bg-[#111B21] z-20">
        {airplane && <Plane size={16} />}
        {!airplane && (
          <>
            {wifi && <Wifi size={16} />}
            <SignalBars bars={signalBars} />
            <span className="text-xs font-sans">{networkLabel}</span>
          </>
        )}
        <div className="flex items-center gap-0.5">
          {charging ? <BatteryCharging size={20} /> : <BatteryFull size={20} />}
          <span className="text-xs font-sans">{batteryPercent}%</span>
        </div>
        {location && <LocateIcon size={14} />}
      </div>
    );
  }
  // iPhone style
  return (
    <div className="absolute top-0 left-0 right-0 h-11 px-6 flex items-center justify-between text-white/90 z-20">
      <span className="text-sm font-semibold w-12 text-center">{phoneTime}</span>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-8 bg-black rounded-b-lg"></div>
      <div className="flex items-center gap-1.5">
        {airplane ? <Plane size={16} /> :
          <>
            {wifi && <Wifi size={16} />}
            <SignalBars bars={signalBars} />
          </>
        }
        <div className="flex items-center gap-1">
            <span className="text-xs font-sans -mr-1">{batteryPercent}%</span>
            <div className="relative w-6 h-3 border border-white/80 rounded-sm p-px">
                <div 
                    className={cn('h-full rounded-sm', charging ? 'bg-green-400' : 'bg-white/90')} 
                    style={{ width: `${batteryPercent - 15}%`}}
                />
            </div>
        </div>
      </div>
    </div>
  );
};


const ChatHeader = ({ header, options }: { header: ChatHeaderOptions, options: StatusBarOptions }) => {
    const isAndroid = options.interfaceStyle === 'android';
    return (
        <header className={cn(
            "absolute top-0 left-0 right-0 z-10 flex items-center p-2.5 text-white",
            isAndroid ? 'bg-[#111B21]' : 'bg-[#005E54]',
            options.hideTop ? 'pt-4' : (isAndroid ? 'pt-10' : 'pt-11')
        )}>
            {isAndroid || options.showBackArrow ? <ArrowLeft size={24} className="mr-2" /> : null}
            <Avatar className="h-10 w-10 mr-3 border-2 border-white/20">
                <AvatarImage src={header.profileUrl ?? undefined} alt={header.name} data-ai-hint="person avatar" />
                <AvatarFallback className="bg-gray-600 text-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">{header.name}</h2>
                    {header.unreadCount && <span className="bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{header.unreadCount}</span>}
                </div>
                {header.status && <p className="text-sm text-white/80">{header.status}</p>}
            </div>
            <div className="flex items-center gap-5 text-white/90">
                <Video size={24} />
                <Phone size={24} />
                <MoreVertical size={24} />
            </div>
        </header>
    );
}

const ChatInput = ({ hidden, showKeyboard, isAndroid }: { hidden?: boolean, showKeyboard?: boolean, isAndroid?: boolean }) => {
    if (hidden) return null;
    if (showKeyboard) {
        return (
             <div className="h-[290px] w-full bg-[#1c1c1c] flex-shrink-0" />
        )
    }
    return (
        <div className="h-14 bg-[#111B21] flex items-center px-2 py-2 gap-2 flex-shrink-0">
            <div className="flex-1 bg-[#202C33] rounded-full flex items-center px-4 gap-3 h-full">
                <Smile className="text-gray-400" />
                <span className="text-gray-400 text-lg flex-1">Message</span>
                <Paperclip className="text-gray-400 -rotate-45" />
                <Camera className="text-gray-400" />
            </div>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
               isAndroid ? 'bg-green-600' : 'bg-[#00A884]'
            )}>
                <Mic className="text-white" />
            </div>
        </div>
    )
}


const WhatsAppLivePreview: React.FC<WhatsAppLivePreviewProps> = ({
  options = {},
  header,
  messages,
  loading = false,
  error = null,
  generatedImage = null,
  className,
  hideBottom = false,
}) => {
  const sanitizedMessages = useMemo(() => {
    return messages.filter((msg) => (msg.text && msg.text.trim().length > 0) || msg.imageUrl || msg.audioLabel);
  }, [messages]);

  const isAndroid = options.interfaceStyle === 'android';

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-black/20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm">Gerando imagem...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-500/10 p-4">
          <ImageIcon className="h-12 w-12" />
          <h3 className="mt-4 font-semibold">Erro ao Gerar Imagem</h3>
          <p className="mt-1 text-sm text-red-400/80">{error}</p>
        </div>
      );
    }
    
    if (sanitizedMessages.length === 0 && !generatedImage) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <ImageIcon className="h-16 w-16 mb-4" />
                <h3 className="font-bold text-lg">Sua imagem aparecerá aqui</h3>
                <p>Preencha os dados e adicione mensagens para começar.</p>
            </div>
        )
    }

    return (
       <div 
        className="h-full w-full bg-contain"
        style={{ backgroundImage: "url('/whatsapp-bg-dark.jpg')"}}
      >
        <div className="flex h-full flex-col justify-end p-4 space-y-2">
            <AnimatePresence initial={false}>
                {sanitizedMessages.map((message) => (
                <motion.div
                    key={message.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn(
                    'flex max-w-[80%] items-end gap-2',
                    message.sender === 'me' ? 'self-end' : 'self-start'
                    )}
                >
                    <div
                    className={cn(
                        'relative rounded-lg px-3 py-1.5 text-sm shadow-md',
                        message.sender === 'me'
                        ? (isAndroid ? 'bg-[#005C4B] text-white rounded-tr-lg' : 'bg-[#005C4B] text-white rounded-tr-none')
                        : 'bg-[#202C33] text-white rounded-tl-none'
                    )}
                    >
                    
                    {message.kind === 'image' && message.imageUrl && (
                        <img src={message.imageUrl} alt="chat image" className="rounded-md mb-1 max-w-full h-auto" data-ai-hint="user content" />
                    )}

                    {message.kind === 'audio' && (
                        <div className="flex items-center gap-2 pr-4">
                            <Play className="h-6 w-6 text-green-500 fill-green-500"/>
                            <div className="h-1 w-24 bg-gray-500 rounded-full relative">
                                <div className="absolute top-0 left-0 h-1 w-2/3 bg-green-500 rounded-full"></div>
                                <div className="absolute -top-0.5 left-2/3 h-2 w-2 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-xs text-gray-400">{message.audioLabel || '0:00'}</span>
                        </div>
                    )}
                    
                    {message.text && <p className="text-white whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-400 underline">$1</a>') }} />}

                    <div className="flex justify-end items-center gap-1 mt-1 h-3">
                        <span className="text-xs text-gray-400">
                          {message.time || DEFAULT_TIME}
                        </span>
                        {message.sender === 'me' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-500 -mb-0.5">
                                <path d="M1.5 12.5L5.5 16.5L8 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M7 12.5L11 16.5L22.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.5 5L12.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}
                    </div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
        "aspect-[9/16] w-full bg-[#111B21] border-[10px] border-black overflow-hidden shadow-2xl relative flex flex-col",
        isAndroid ? 'rounded-2xl' : 'rounded-[40px]',
        className
    )}>
        
        <StatusBar options={options} />
        
        <ChatHeader header={header} options={options} />

        <main className={cn(
            "flex-1 overflow-y-auto",
             options.hideTop ? (isAndroid ? 'mt-[60px]' : 'mt-[68px]') : (isAndroid ? 'mt-[88px]' : 'mt-[96px]')
        )}>
          {renderContent()}
        </main>
        
        <ChatInput hidden={hideBottom} showKeyboard={options.showKeyboard} isAndroid={isAndroid} />

    </div>
  );
};
export default React.memo(WhatsAppLivePreview);

export const __TEST_CASES__ = {
  minimal: {
    header: { name: 'Cliente Satisfeito' },
    messages: [
      { id: '1', sender: 'client' as const, text: 'Olá, recebi meu produto!' },
      { id: '2', sender: 'me' as const, text: 'Que ótimo! O que achou?' },
    ],
  },
  prankshitLike: {
    options: {
        interfaceStyle: 'iphone' as const,
        phoneTime: '10:04',
        icons: {
            networkLabel: '4G' as const,
            batteryPercent: 50,
            charging: true,
            signalBars: 1 as const,
            wifi: true,
        }
    },
    header: {
        name: 'Maria Souza',
        status: 'online',
        profileUrl: 'https://picsum.photos/seed/maria/200/200'
    },
    messages: [
      { id: '1', sender: 'client' as const, text: 'Oi!' },
      { id: '2', sender: 'me' as const, kind: 'image' as const, imageUrl: 'https://picsum.photos/seed/chat-img/600/400'},
      { id: '3', sender: 'client' as const, text: 'Uau! E sobre o link? https://scalify.com' },
      { id: '4', sender: 'me' as const, kind: 'audio' as const, audioLabel: '0:12'},
    ],
  },
};

    