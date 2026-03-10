// src/handlers/modal.js — Modal Submit Handler
// NOTE: The old Korean commands (세팅등록/세팅수정) that triggered these modals
// have been removed. These handlers remain to gracefully handle any stale Discord UI.
import { WEB_URL } from '../config.js';

/**
 * Handle setup_modal_* modal submit interactions (legacy).
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('discord.js').Client} _client
 */
export async function handleModal(interaction, _client) {
  await interaction.reply({
    content: `이 기능은 웹으로 이전되었습니다. 웹에서 세팅을 등록하세요: ${WEB_URL}/setup/me`,
    flags: 64,
  });
}

/**
 * Handle setup_edit_modal_* modal submit interactions (legacy).
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('discord.js').Client} _client
 */
export async function handleEditModal(interaction, _client) {
  await interaction.reply({
    content: `이 기능은 웹으로 이전되었습니다. 웹에서 세팅을 수정하세요: ${WEB_URL}/setup/me`,
    flags: 64,
  });
}
