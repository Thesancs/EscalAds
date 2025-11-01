'use server';
/**
 * @fileOverview Flow para gerar uma imagem de conversa de WhatsApp.
 *
 * - generateWhatsappImage: Gera uma imagem de uma conversa de WhatsApp a partir de um roteiro.
 * - WhatsappImageGeneratorInput: O tipo de entrada para a função.
 * - WhatsappImageGeneratorOutput: O tipo de retorno para a função.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/googleai';

const WhatsappImageGeneratorInputSchema = z.object({
  contactName: z.string().describe('O nome do contato no topo da conversa.'),
  chatScript: z
    .string()
    .describe(
      'O roteiro da conversa. Use "Eu:" para as mensagens do usuário e o nome do contato para as mensagens dele.'
    ),
  profilePictureDataUri: z
    .string()
    .nullable()
    .describe(
      "A foto de perfil do contato como uma data URI. Formato: 'data:<mimetype>;base64,<encoded_data>'. Se for nulo, use uma imagem de placeholder."
    ),
});
export type WhatsappImageGeneratorInput = z.infer<
  typeof WhatsappImageGeneratorInputSchema
>;

const WhatsappImageGeneratorOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A imagem gerada como uma data URI no formato 'data:image/png;base64,<encoded_data>'."
    ),
});
export type WhatsappImageGeneratorOutput = z.infer<
  typeof WhatsappImageGeneratorOutputSchema
>;

export async function generateWhatsappImage(
  input: WhatsappImageGeneratorInput
): Promise<WhatsappImageGeneratorOutput> {
  return whatsappImageGeneratorFlow(input);
}

const whatsappImageGeneratorFlow = ai.defineFlow(
  {
    name: 'whatsappImageGeneratorFlow',
    inputSchema: WhatsappImageGeneratorInputSchema,
    outputSchema: WhatsappImageGeneratorOutputSchema,
  },
  async (input) => {
    const prompt = `
      Você é um especialista em criar imagens de conversas de WhatsApp.
      Sua tarefa é gerar uma imagem realista de uma tela de celular mostrando uma conversa no WhatsApp.

      Requisitos da Imagem:
      - A imagem deve ser vertical, no formato de uma tela de smartphone (proporção 9:16).
      - O topo da imagem deve mostrar a interface do WhatsApp com o nome do contato e a foto de perfil.
      - As mensagens devem seguir o roteiro fornecido.
      - Mensagens de "Eu:" devem aparecer como balões de envio (geralmente à direita, em verde claro).
      - Mensagens do contato ("${input.contactName}") devem aparecer como balões de recebimento (geralmente à esquerda, em branco ou cinza claro).
      - Inclua os timestamps (horários) ao lado das mensagens de forma realista.
      - O fundo da conversa deve ser o padrão do WhatsApp.
      - A imagem final deve ser um PNG limpo e de alta qualidade.

      Detalhes da Conversa:
      - Nome do Contato: ${input.contactName}
      {{#if profilePictureDataUri}}
      - Foto de Perfil: Use a imagem fornecida.
      {{else}}
      - Foto de Perfil: Use uma foto de perfil genérica e neutra (um ícone de usuário cinza).
      {{/if}}
      - Roteiro da Conversa:
      ---
      ${input.chatScript}
      ---
    `;

    const { media } = await ai.generate({
      model: googleAI.model('imagen-4.0-fast-generate-001'),
      prompt,
      config: {
        aspectRatio: '9:16',
      },
    });

    if (!media.url) {
      throw new Error('A geração de imagem falhou ao não retornar uma URL.');
    }

    return { imageDataUri: media.url };
  }
);
