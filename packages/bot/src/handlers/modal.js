// src/handlers/modal.js — Modal Submit Handler (core orchestration)
import { AttachmentBuilder } from 'discord.js';
import { createSetupEmbed } from '../embed.js';
import { generateSetupCard } from '../imageGenerator.js';
import { insertSetup, getSetupByUserId, updateSetup, ensureProfile } from '../supabase.js';
import { WEB_URL } from '../config.js';

/**
 * Handle setup_modal_* modal submit interactions.
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('discord.js').Client} client
 */
export async function handleModal(interaction, client) {
  const sections = interaction.customId.split('_').slice(2);

  // --- Validate inputs ---
  const data = {};
  for (const section of sections) {
    const value = interaction.fields.getTextInputValue(section).trim();

    if (section !== 'tips' && !value) {
      return interaction.reply({
        content: `❌ ${section} 항목을 입력해주세요.`,
        flags: 64,
      });
    }

    if (value) {
      data[section] = value;
    }
  }

  try {
    await interaction.deferReply({ flags: 64 });

    // Ensure profile exists with proper username
    await ensureProfile(interaction.user);

    // --- Generate card image ---
    let cardBuffer = null;
    try {
      cardBuffer = await generateSetupCard(interaction.user.id, {
        username: interaction.user.username,
        ...data,
        date: new Date().toLocaleDateString('ko-KR'),
      });
    } catch (err) {
      console.error('[modal] Card generation failed:', err);
    }

    // --- Create embed ---
    const { embed, files, components } = createSetupEmbed(interaction.user, data, sections);

    if (cardBuffer) {
      files.push(new AttachmentBuilder(cardBuffer, { name: 'setup_card.png' }));
      embed.setImage('attachment://setup_card.png');
    }

    // --- Fetch forum channel ---
    const forumChannel = await client.channels.fetch(process.env.FORUM_CHANNEL_ID);
    if (!forumChannel) {
      return interaction.editReply({ content: '❌ 포럼 채널을 찾을 수 없습니다.' });
    }

    // --- Apply forum tags ---
    const tagMap = { sens: '감도', gear: '장비', game: '그래픽', tips: '꿀팁' };
    const appliedTags = [];
    if (forumChannel.availableTags) {
      for (const section of sections) {
        const tag = forumChannel.availableTags.find(t => t.name === tagMap[section]);
        if (tag) appliedTags.push(tag.id);
      }
    }

    // --- Create forum thread ---
    const thread = await forumChannel.threads.create({
      name: `${interaction.user.username} Setup`,
      message: { embeds: [embed], files, components },
      appliedTags,
    });

    // --- Insert into DB ---
    const dbResult = await insertSetup(interaction.user.id, thread.id, data);
    if (!dbResult.success) {
      console.error('[modal] DB insert failed:', dbResult.error);
    }

    await interaction.editReply({
      content: `✅ 세팅이 등록되었습니다!\n🔗 ${thread.url}\n\n웹에서 더 편하게 관리: ${WEB_URL}/setup/me`,
    });
  } catch (error) {
    console.error('[modal] 세팅 등록 중 오류:', error);
    const errorMessage = '❌ 세팅 등록에 실패했습니다. 잠시 후 다시 시도해주세요.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMessage }).catch(() => {});
    } else {
      await interaction.reply({ content: errorMessage, flags: 64 }).catch(() => {});
    }
  }
}

/**
 * Handle setup_edit_modal_* modal submit interactions.
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('discord.js').Client} client
 */
export async function handleEditModal(interaction, client) {
  const sections = interaction.customId.split('_').slice(3);

  const data = {};
  for (const section of sections) {
    const value = interaction.fields.getTextInputValue(section).trim();

    if (section !== 'tips' && !value) {
      return interaction.reply({
        content: `❌ ${section} 항목을 입력해주세요.`,
        flags: 64,
      });
    }

    if (value) {
      data[section] = value;
    }
  }

  try {
    await interaction.deferReply({ flags: 64 });

    const existing = await getSetupByUserId(interaction.user.id);
    if (!existing) {
      return interaction.editReply({ content: '❌ 등록된 세팅이 없습니다.' });
    }

    const mergedData = {
      sens: data.sens || existing.sens || null,
      gear: data.gear || existing.gear || null,
      game: data.game || existing.game || null,
      tips: data.tips || existing.tips || null,
    };

    const allSections = ['sens', 'gear', 'game', 'tips'].filter(s => mergedData[s]);

    let cardBuffer = null;
    try {
      cardBuffer = await generateSetupCard(interaction.user.id, {
        username: interaction.user.username,
        ...mergedData,
        date: new Date().toLocaleDateString('ko-KR'),
      });
    } catch (err) {
      console.error('[modal] Card generation failed:', err);
    }

    const { embed, files, components } = createSetupEmbed(interaction.user, mergedData, allSections);

    if (cardBuffer) {
      files.push(new AttachmentBuilder(cardBuffer, { name: 'setup_card.png' }));
      embed.setImage('attachment://setup_card.png');
    }

    await updateSetup(interaction.user.id, data);

    await interaction.editReply({
      content: `✅ 세팅이 수정되었습니다!\n\n웹에서 더 편하게 관리: ${WEB_URL}/setup/me`,
    });
  } catch (error) {
    console.error('[modal] 세팅 수정 중 오류:', error);
    const errorMessage = '❌ 세팅 수정에 실패했습니다. 잠시 후 다시 시도해주세요.';
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: errorMessage }).catch(() => {});
    } else {
      await interaction.reply({ content: errorMessage, flags: 64 }).catch(() => {});
    }
  }
}
