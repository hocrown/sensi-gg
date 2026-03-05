import { EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

const EMBED_COLOR = 0xF4D27A; // Fairy Light Gold — 전구 포인트 컬러바

const SECTIONS = {
  sens: { label: '감도', emoji: '🎯' },
  gear: { label: '장비', emoji: '⌨️' },
  game: { label: '그래픽', emoji: '🖥️' },
  tips: { label: '꿀팁', emoji: '💡' },
};

// ---------------------------------------------------------------------------
// Structured renderers
// ---------------------------------------------------------------------------

function formatSens(d) {
  const lines = [];

  // Line 1: DPI / 인게임 / eDPI
  const parts1 = [];
  if (d.dpi != null && d.dpi !== '') parts1.push(`DPI: ${d.dpi}`);
  if (d.ingame != null && d.ingame !== '') parts1.push(`인게임: ${d.ingame}`);
  if (d.dpi != null && d.dpi !== '' && d.ingame != null && d.ingame !== '') {
    const edpi = Number(d.dpi) * Number(d.ingame);
    if (!isNaN(edpi)) parts1.push(`eDPI: ${edpi.toLocaleString()}`);
  }
  if (parts1.length > 0) lines.push(parts1.join(' | '));

  // Line 2: 조준 / 수직배율
  const parts2 = [];
  if (d.ads != null && d.ads !== '') parts2.push(`조준: ${d.ads}`);
  if (d.verticalMultiplier != null && d.verticalMultiplier !== '') parts2.push(`수직배율: ${d.verticalMultiplier}`);
  if (parts2.length > 0) lines.push(parts2.join(' | '));

  // Line 3: 배율별 감도
  const scopeParts = [];
  if (d.scope2x != null && d.scope2x !== '') scopeParts.push(`2× ${d.scope2x}`);
  if (d.scope4x != null && d.scope4x !== '') scopeParts.push(`4× ${d.scope4x}`);
  if (d.scope6x != null && d.scope6x !== '') scopeParts.push(`6× ${d.scope6x}`);
  if (d.scope8x != null && d.scope8x !== '') scopeParts.push(`8× ${d.scope8x}`);
  if (scopeParts.length > 0) lines.push(`배율: ${scopeParts.join(' / ')}`);

  // Line 4: 메모
  if (d.note != null && d.note !== '') lines.push(`메모: ${d.note}`);

  return lines.join('\n');
}

function formatGear(d) {
  const lines = [];
  if (d.mouse != null && d.mouse !== '') lines.push(`🖱️ ${d.mouse}`);
  if (d.keyboard != null && d.keyboard !== '') lines.push(`⌨️ ${d.keyboard}`);
  if (d.monitor != null && d.monitor !== '') {
    let monitorStr = `🖥️ ${d.monitor}`;
    const extras = [];
    if (d.refreshRate != null && d.refreshRate !== '') extras.push(`${d.refreshRate}`);
    if (d.resolution != null && d.resolution !== '') extras.push(`${d.resolution}`);
    if (extras.length > 0) monitorStr += ` ${extras.join(' / ')}`;
    lines.push(monitorStr);
  }
  if (d.headset != null && d.headset !== '') lines.push(`🎧 ${d.headset}`);
  if (d.mousepad != null && d.mousepad !== '') lines.push(`🏁 ${d.mousepad}`);
  if (d.note != null && d.note !== '') lines.push(d.note);
  return lines.join('\n');
}

function formatGame(d) {
  const lines = [];

  // Line 1: 렌더링 / AA
  const parts1 = [];
  if (d.renderScale != null && d.renderScale !== '') parts1.push(`렌더링: ${d.renderScale}`);
  if (d.antiAliasing != null && d.antiAliasing !== '') parts1.push(`AA: ${d.antiAliasing}`);
  if (parts1.length > 0) lines.push(parts1.join(' | '));

  // Line 2: 후처리 / 그림자 / 텍스처
  const parts2 = [];
  if (d.postProcessing != null && d.postProcessing !== '') parts2.push(`후처리: ${d.postProcessing}`);
  if (d.shadows != null && d.shadows !== '') parts2.push(`그림자: ${d.shadows}`);
  if (d.textures != null && d.textures !== '') parts2.push(`텍스처: ${d.textures}`);
  if (parts2.length > 0) lines.push(parts2.join(' | '));

  // Line 3: 효과 / 식생 / 거리
  const parts3 = [];
  if (d.effects != null && d.effects !== '') parts3.push(`효과: ${d.effects}`);
  if (d.foliage != null && d.foliage !== '') parts3.push(`식생: ${d.foliage}`);
  if (d.viewDistance != null && d.viewDistance !== '') parts3.push(`거리: ${d.viewDistance}`);
  if (parts3.length > 0) lines.push(parts3.join(' | '));

  // Line 4: FPS / 모션블러 / VSync
  const parts4 = [];
  if (d.fpsCap != null && d.fpsCap !== '') parts4.push(`FPS: ${d.fpsCap}`);
  if (d.motionBlur != null && d.motionBlur !== '') parts4.push(`모션블러: ${d.motionBlur === true || d.motionBlur === 'true' ? 'ON' : 'OFF'}`);
  if (d.vsync != null && d.vsync !== '') parts4.push(`VSync: ${d.vsync === true || d.vsync === 'true' ? 'ON' : 'OFF'}`);
  if (parts4.length > 0) lines.push(parts4.join(' | '));

  // Line 5: 화면 모드
  if (d.displayMode != null && d.displayMode !== '') lines.push(`화면: ${d.displayMode}`);

  return lines.join('\n');
}

function formatTips(d) {
  const lines = [];
  if (Array.isArray(d.categories) && d.categories.length > 0) {
    lines.push(`[${d.categories.join(', ')}]`);
  }
  if (d.content != null && d.content !== '') lines.push(d.content);
  return lines.join('\n');
}

/**
 * Try to render structured JSON for a section. Falls back to raw text.
 * @param {string} section - One of 'sens'|'gear'|'game'|'tips'
 * @param {string} rawValue - Raw string from data
 * @returns {string}
 */
function formatSectionValue(section, rawValue) {
  let parsed;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return rawValue.slice(0, 1024);
  }

  let structured = '';
  if (section === 'sens') structured = formatSens(parsed);
  else if (section === 'gear') structured = formatGear(parsed);
  else if (section === 'game') structured = formatGame(parsed);
  else if (section === 'tips') structured = formatTips(parsed);
  else structured = rawValue;

  return structured.trim() !== '' ? structured.slice(0, 1024) : rawValue.slice(0, 1024);
}

/**
 * Create a setup embed with optional asset attachments.
 * @param {import('discord.js').User} user - Discord user object
 * @param {{ sens?: string, gear?: string, game?: string, tips?: string }} data - Section content
 * @param {string[]} selectedSections - Array of section keys (e.g. ['sens', 'gear'])
 * @returns {{ embed: EmbedBuilder, files: AttachmentBuilder[], components: ActionRowBuilder[] }}
 */
export function createSetupEmbed(user, data, selectedSections) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setAuthor({ name: user.display_name || user.username, iconURL: user.displayAvatarURL() })
    .setTitle('🎮 PUBG Setup')
    .setDescription('SENSI.GG로 등록된 세팅입니다.')
    .setFooter({ text: 'SENSI.GG' })
    .setTimestamp();

  for (const section of selectedSections) {
    if (data[section] && SECTIONS[section]) {
      const { emoji, label } = SECTIONS[section];
      embed.addFields({
        name: `${emoji} ${label}`,
        value: formatSectionValue(section, data[section]),
        inline: false,
      });
    }
  }

  const files = [];

  // Banner image
  const bannerPath = path.join(ASSETS_DIR, 'banner_setup_db.png');
  if (fs.existsSync(bannerPath)) {
    files.push(new AttachmentBuilder(bannerPath, { name: 'banner_setup_db.png' }));
    embed.setImage('attachment://banner_setup_db.png');
  }

  // Thumbnail — use the first selected section's thumbnail
  if (selectedSections.length > 0) {
    const firstSection = selectedSections[0];
    const thumbFilename = `thumb_${firstSection}.png`;
    const thumbPath = path.join(ASSETS_DIR, thumbFilename);
    if (fs.existsSync(thumbPath)) {
      files.push(new AttachmentBuilder(thumbPath, { name: thumbFilename }));
      embed.setThumbnail(`attachment://${thumbFilename}`);
    }
  }

  // Like button
  const likeButton = new ButtonBuilder()
    .setCustomId(`setup_like_${user.id}`)
    .setLabel('❤️ 0')
    .setStyle(ButtonStyle.Secondary);

  const components = [new ActionRowBuilder().addComponents(likeButton)];

  return { embed, files, components };
}

const SECTION_LABELS = {
  sens: '🎯 감도',
  gear: '⌨️ 장비',
  game: '🖥️ 그래픽',
  tips: '💡 꿀팁',
};

/**
 * Create an embed with search results and pagination buttons.
 * @param {{ results: object[], total: number, page: number, totalPages: number }} searchResult
 * @param {{ userId?: string, tag?: string }} filters
 * @param {import('discord.js').Client} client
 * @returns {{ embed: EmbedBuilder, components: import('discord.js').ActionRowBuilder[] }}
 */
export function createSearchResultEmbed(searchResult, filters, client) {
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .setTitle('🔍 세팅 검색 결과')
    .setDescription(`총 ${searchResult.total}개의 세팅이 발견되었습니다.`)
    .setFooter({ text: `페이지 ${searchResult.page}/${searchResult.totalPages}` })
    .setTimestamp();

  for (const row of searchResult.results) {
    const sections = Object.keys(SECTION_LABELS)
      .filter(key => row[key])
      .map(key => SECTION_LABELS[key]);
    const sectionStr = sections.length > 0 ? sections.join(' | ') : '(없음)';
    const threadLink = `[세팅 보기](https://discord.com/channels/${process.env.GUILD_ID}/${row.threadId})`;

    embed.addFields({
      name: `<@${row.userId}>`,
      value: `${sectionStr}\n${threadLink}`,
      inline: false,
    });
  }

  // Build pagination buttons
  const components = [];

  if (searchResult.totalPages > 1) {
    // Encode filters as string
    const filterParts = [];
    if (filters.userId) filterParts.push(`userId:${filters.userId}`);
    if (filters.tag) filterParts.push(`tag:${filters.tag}`);
    const filtersStr = filterParts.join(',');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`search_prev_${searchResult.page}_${filtersStr}`)
        .setLabel('◀ 이전')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(searchResult.page === 1),
      new ButtonBuilder()
        .setCustomId(`search_next_${searchResult.page}_${filtersStr}`)
        .setLabel('다음 ▶')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(searchResult.page === searchResult.totalPages),
    );

    components.push(row);
  }

  return { embed, components };
}
