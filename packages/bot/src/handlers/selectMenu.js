// src/handlers/selectMenu.js — Select Menu Interaction Handler
// NOTE: The old Korean commands (세팅등록/세팅수정) that triggered these select menus
// have been removed. This handler remains to gracefully handle any stale Discord UI.
import { WEB_URL } from '../config.js';

/**
 * Handle setup_select and setup_edit_select string select menu interactions.
 * These are legacy interactions from deleted Korean commands.
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
export async function handleSelectMenu(interaction) {
  await interaction.reply({
    content: `이 기능은 웹으로 이전되었습니다. 웹에서 세팅을 관리하세요: ${WEB_URL}/setup/me`,
    flags: 64,
  });
}
