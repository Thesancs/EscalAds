'use client';

import React, { useId, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowDown,
  ArrowUp,
  PlusCircle,
  Settings,
  Trash2,
} from 'lucide-react';
import type {
  ChatHeaderOptions,
  ChatMessage,
  StatusBarOptions,
} from './WhatsAppLivePreview';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Slider } from '../ui/slider';

type Sender = 'client' | 'me';
type Kind = 'text' | 'image' | 'audio';
export type DraftMsg = {
  id: string;
  sender: Sender;
  kind: Kind;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
  audioLabel?: string;
  time?: string;
};

export type ConversationDesignerState = {
  autoAlternate: boolean;
  nextSender: Sender;
  defaultTime: string;
  messages: DraftMsg[];
  options: StatusBarOptions;
  header: ChatHeaderOptions;
};

type ConversationDesignerProps = {
  initialState: ConversationDesignerState;
  onChange: (state: ConversationDesignerState) => void;
};

const ConversationDesigner: React.FC<ConversationDesignerProps> = ({
  initialState,
  onChange,
}) => {
  const [state, setState] = useState(initialState);
  const id = useId();

  const handleStateChange = (newState: Partial<ConversationDesignerState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    onChange(updatedState);
  };
  
  const handleOptionsChange = (newOptions: Partial<StatusBarOptions>) => {
    handleStateChange({ options: { ...state.options, ...newOptions } });
  }

  const handleIconsChange = (newIcons: Partial<StatusBarOptions['icons']>) => {
    handleOptionsChange({ icons: { ...state.options.icons, ...newIcons } });
  }

  const handleHeaderChange = (newHeader: Partial<ChatHeaderOptions>) => {
    handleStateChange({ header: { ...state.header, ...newHeader } });
  }

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleHeaderChange({ profileUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const addMessage = () => {
    const lastSender = state.messages.length > 0 ? state.messages[state.messages.length - 1].sender : 'client';
    const newSender = lastSender === 'me' ? 'client' : 'me';
    const newId = state.messages.length > 0 ? String(Math.max(...state.messages.map(m => parseInt(m.id))) + 1) : '1';
    
    const newMessages = [...state.messages, { id: newId, sender: newSender, kind: 'text' as const, text: '', time: '14:22' }];
    handleStateChange({ messages: newMessages });
  }

  const updateMessage = (id: string, newText: string) => {
    const newMessages = state.messages.map(msg => msg.id === id ? { ...msg, text: newText } : msg);
    handleStateChange({ messages: newMessages });
  }
  
  const deleteMessage = (id: string) => {
    const newMessages = state.messages.filter(msg => msg.id !== id);
    handleStateChange({ messages: newMessages });
  }

  return (
    <Card className="glassmorphic">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-primary h-6 w-6" />
          Editor da Conversa
        </CardTitle>
        <CardDescription>
          Crie a conversa balão a balão e personalize os detalhes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Roteiro */}
        <div className="space-y-4">
          <h3 className="font-semibold">Roteiro da Conversa</h3>
          {state.messages.map((message, index) => (
            <div
              key={message.id}
              className="p-3 border border-white/10 rounded-lg space-y-2"
            >
              <div className="flex justify-between items-center">
                <Label>
                  {message.sender === 'me'
                    ? 'Eu (balão verde)'
                    : `${state.header.name} (balão cinza)`}
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={index === state.messages.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-500"
                    onClick={() => deleteMessage(message.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                placeholder={`Mensagem de ${message.sender}...`}
                value={message.text}
                onChange={(e) => updateMessage(message.id, e.target.value)}
                className="h-20"
              />
            </div>
          ))}
          <Button onClick={addMessage} variant="outline" className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Mensagem
          </Button>
        </div>

        <Separator className="bg-white/10" />

        {/* Opções Avançadas */}
        <div className="space-y-4 p-4 border border-white/10 rounded-lg">
           <h3 className="font-semibold">Opções da Tela (estilo Prankshit)</h3>

            {/* Ocultar */}
            <div className="grid gap-2 border-b border-white/10 pb-4">
                <h4 className='text-sm font-medium text-muted-foreground'>Ocultar</h4>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${id}-hideTop`}>Parte superior (status bar)</Label>
                    <Switch id={`${id}-hideTop`} checked={!!state.options.hideTop} onCheckedChange={(x)=>handleOptionsChange({ hideTop:x })} />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor={`${id}-hideBottom`}>Parte inferior (input)</Label>
                    <Switch id={`${id}-hideBottom`} checked={!!(state.options as any).hideBottom} onCheckedChange={(x)=>handleOptionsChange({ ...(state.options as any), hideBottom:x })} />
                </div>
            </div>

            {/* Interface */}
            <div className="grid gap-2 border-b border-white/10 pb-4">
                <Label>Interface</Label>
                <RadioGroup
                value={state.options.interfaceStyle || 'iphone'}
                onValueChange={(x)=>handleOptionsChange({ interfaceStyle: x as any })}
                className="grid grid-cols-2 gap-2"
                >
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="android" id={`${id}-android`} />
                    <Label htmlFor={`${id}-android`}>Android</Label>
                </div>
                <div className="flex items-center gap-2">
                    <RadioGroupItem value="iphone" id={`${id}-iphone`} />
                    <Label htmlFor={`${id}-iphone`}>iPhone</Label>
                </div>
                </RadioGroup>
            </div>
            
            {/* Cabeçalho */}
            <div className="grid gap-3 border-b border-white/10 pb-4">
                <h4 className='text-sm font-medium text-muted-foreground'>Cabeçalho</h4>
                <div className="space-y-2">
                    <Label htmlFor="contact-name">Nome do Contato</Label>
                    <Input
                    id="contact-name"
                    placeholder="Ex: Cliente Satisfeito"
                    value={state.header.name}
                    onChange={(e) => handleHeaderChange({ name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="contact-status">Status</Label>
                    <Input
                    id="contact-status"
                    placeholder="online"
                    value={state.header.status}
                    onChange={(e) => handleHeaderChange({ status: e.target.value })}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="unread-count">Msgs não lidas</Label>
                    <Input
                    id="unread-count"
                    placeholder="3"
                    value={state.header.unreadCount}
                    onChange={(e) => handleHeaderChange({ unreadCount: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="profile-pic">Foto de Perfil (Opcional)</Label>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={state.header.profileUrl ?? undefined} data-ai-hint="person avatar" />
                            <AvatarFallback className="bg-muted/50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </AvatarFallback>
                        </Avatar>
                        <Input id="profile-pic" type="file" accept="image/*" onChange={handleProfilePicChange} className="max-w-xs" />
                    </div>
                </div>
            </div>

            {/* Ícones */}
            <div className="grid gap-4">
                <h4 className='text-sm font-medium text-muted-foreground'>Ícones da Status Bar</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                        <Label>Wi-Fi</Label>
                        <Switch checked={!!state.options.icons?.wifi} onCheckedChange={(x)=>handleIconsChange({ wifi:x })} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label>Modo Avião</Label>
                        <Switch checked={!!state.options.icons?.airplane} onCheckedChange={(x)=>handleIconsChange({ airplane:x })} />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label>Carregando</Label>
                        <Switch checked={!!state.options.icons?.charging} onCheckedChange={(x)=>handleIconsChange({ charging:x })} />
                    </div>
                     <div className="flex items-center justify-between">
                        <Label>Localização</Label>
                        <Switch checked={!!state.options.icons?.location} onCheckedChange={(x)=>handleIconsChange({ location:x })} />
                    </div>
                </div>

                <div className="grid gap-1">
                    <Label>Rede</Label>
                    <Input placeholder="4G" value={state.options.icons?.networkLabel || ''} onChange={(e)=>handleIconsChange({ networkLabel: e.target.value as any })}/>
                </div>
                
                <div className="grid gap-1">
                    <Label>Bateria: {state.options.icons?.batteryPercent ?? 80}%</Label>
                    <Slider value={[state.options.icons?.batteryPercent ?? 80]} min={0} max={100} step={1}
                        onValueChange={([x])=>handleIconsChange({ batteryPercent:x })} />
                </div>

                <div className="grid gap-1">
                    <Label>Sinal: {state.options.icons?.signalBars ?? 4}</Label>
                    <Slider value={[state.options.icons?.signalBars ?? 4]} min={0} max={4} step={1}
                        onValueChange={([x])=>handleIconsChange({ signalBars:x as any })} />
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationDesigner;