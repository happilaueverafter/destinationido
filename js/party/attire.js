
/**
 * Wedding Party — Attire
 * js/party/attire.js
 *
 * Framework-free data / presentation helpers.
 * Does not fetch Google Sheets itself.
 *
 * Load before party.js:
 * <script src="js/party/attire.js" defer></script>
 *
 * Public API: window.PartyAttire
 *
 * Usage:
 *   PartyAttire.setItems(exportedAttireRows);
 *
 *   const model = PartyAttire.buildForPerson({
 *     role: 'Bridesman',
 *     attireGroup: 'Bridesmen'
 *   });
 *
 *   PartyAttire.render(
 *     document.querySelector('#attire-detail'),
 *     model
 *   );
 *
 * Sheet columns supported (case-insensitive):
 * Attire Group, Item, Color, Provided By,
 * Order Link, Order Window, Notes
 *
 * Optional:
 * Display Order, Image URL, Requirement
 *
 * Multiple groups can be separated by comma or semicolon.
 */

(function (global) {
  'use strict';

  // ==========================================
  // 1. WEDDING COLORS
  // ==========================================

  const COLORS = Object.freeze({
    'Slate Grey': '#6D7279',
    'Matcha': '#798E77',
    'Eucalyptus': '#53796C',
    'Champagne': '#EEE2D6',
    'Burnt Orange': '#A2411D',
    'English Rose': '#C39C85',
    'Burgundy': '#541125',
    'Soft Ivory': '#F2EFE8',
    'Cognac Brown': '#925B39',
    'Cream': '#E9E1D4'
  });

  // Full-page, side-specific palette headers.

  const PALETTES = Object.freeze({
    groom: {
      title: 'Groom’s Side',
      colors: [
        'Slate Grey',
        'Burnt Orange',
        'Champagne',
        'Soft Ivory',
        'Matcha',
        'English Rose'
      ]
    },

    bride: {
      title: 'Bride’s Side',
      colors: [
        'Matcha',
        'Eucalyptus',
        'Champagne',
        'Soft Ivory',
        'Burnt Orange',
        'Burgundy'
      ]
    },

    officiant: {
      title: 'Officiant',
      colors: [
        'Champagne',
        'Matcha',
        'Burnt Orange',
        'Soft Ivory',
        'English Rose'
      ]
    },

    kids: {
      title: 'Little Helpers',
      colors: [
        'English Rose',
        'Eucalyptus',
        'Slate Grey',
        'Champagne',
        'Burnt Orange',
        'Soft Ivory'
      ]
    }
  });

  // ==========================================
  // 2. ROLE / ATTIRE GROUP MAPPING
  // ==========================================

  // Adjust these names to match your People sheet.

  const ROLE_CONFIG = {
    'groom': {
      side: 'groom',
      group: 'Groom',
      floral: 'groom'
    },

    'best man': {
      side: 'groom',
      group: 'Groomsmen',
      floral: 'groomsmen'
    },

    'groomsman': {
      side: 'groom',
      group: 'Groomsmen',
      floral: 'groomsmen'
    },

    'groomsmen': {
      side: 'groom',
      group: 'Groomsmen',
      floral: 'groomsmen'
    },

    'bridesman': {
      side: 'bride',
      group: 'Bridesmen',
      floral: 'bridesmen'
    },

    'bridesmen': {
      side: 'bride',
      group: 'Bridesmen',
      floral: 'bridesmen'
    },

    'maid of honor': {
      side: 'bride',
      group: 'Bridesmaids',
      floral: 'bridesmaids',
      hairMakeup: true
    },

    'matron of honor': {
      side: 'bride',
      group: 'Bridesmaids',
      floral: 'bridesmaids',
      hairMakeup: true
    },

    'bridesmaid': {
      side: 'bride',
      group: 'Bridesmaids',
      floral: 'bridesmaids',
      hairMakeup: true
    },

    'bridesmaids': {
      side: 'bride',
      group: 'Bridesmaids',
      floral: 'bridesmaids',
      hairMakeup: true
    },

    'brideswoman': {
      side: 'bride',
      group: 'Brideswoman',
      floral: 'brideswoman',
      hairMakeup: true
    },

    'officiant': {
      side: 'officiant',
      group: 'Officiant',
      floral: 'officiant'
    },

    'flower girl': {
      side: 'kids',
      group: 'Flower Girl',
      floral: 'flowerGirl'
    },

    'ring bearer': {
      side: 'kids',
      group: 'Ring Bearer',
      floral: 'ringBearer'
    }
  };

  // ==========================================
  // 3. FLORAL PAIRINGS
  // ==========================================

  // These are independent of your Attire Items sheet.
  // Edit the colors and descriptions as you finalize
  // the actual flower arrangements.

  const FLORALS = {
    groom: {
      type: 'Boutonnière',
      colors: ['Soft Ivory', 'Matcha'],
      description:
        'Soft ivory florals with a subtle sage accent.'
    },

    groomsmen: {
      type: 'Boutonnière',
      colors: ['Matcha', 'Champagne'],
      description:
        'Sage greenery and champagne-toned floral accents.'
    },

    bridesmen: {
      type: 'Boutonnière',
      colors: ['Burnt Orange', 'Champagne'],
      description:
        'Warm burnt orange with a soft champagne accent.'
    },

    bridesmaids: {
      type: 'Bouquet',
      colors: ['Burnt Orange', 'Champagne'],
      description:
        'Warm terracotta and champagne florals.'
    },

    brideswoman: {
      type: 'Bouquet',
      colors: ['Matcha', 'Champagne'],
      description:
        'Sage and champagne florals.'
    },

    officiant: {
      type: 'Boutonnière',
      colors: ['Matcha', 'Burnt Orange'],
      description:
        'Sage with a restrained burnt-orange accent.'
    },

    flowerGirl: {
      type: 'Floral accessory',
      colors: ['Soft Ivory', 'Burgundy'],
      description:
        'Soft ivory flowers with burgundy accents; final arrangement TBD.'
    },

    ringBearer: {
      type: 'Floral accent',
      colors: ['Matcha', 'Champagne'],
      description:
        'A small coordinating floral accent, if used; final arrangement TBD.'
    }
  };

  // ==========================================
  // 4. GENERAL ATTIRE INFORMATION
  // ==========================================

  const GENERAL = {
    intro:
      'Our colors are coordinated, but your comfort and personal style matter most. Unless a specific color, fabric, or item is marked as required, the examples are inspiration—not an exact shopping list.',

    azazie: {
      title: 'How Azazie works',
      text:
        'Azazie offers sizing information and, for eligible styles and locations, an at-home try-on program. You can explore styles, review measurements, and arrange eligible try-ons before our group order window. Try-on availability, fees, return deadlines, and suit options vary—please check the current details directly with Azazie.',
      url: 'https://www.azazie.com/'
    },

    orderWarning: {
      title: 'Please wait for the group order window',
      text:
        'If you’re ordering a color-matched item from Azazie or Birdy Grey, please do not place the final order until your assigned ordering window. Ordering together helps reduce differences between production batches, although an exact dye-lot match cannot be guaranteed. Browsing, measuring, and eligible try-ons beforehand are encouraged.'
    },

    hairMakeup: {
      title: 'Hair & makeup',
      text:
        'Wedding-day hair and makeup services are provided by the bride and groom for the women in the wedding party. There are no required hairstyles or makeup looks—choose what makes you feel like yourself! Any additional services or upgrades you request are at your own expense. Optional trial appointments are also self-funded.'
    },

    florals:
      'All wedding-party bouquets, boutonnières, and other planned florals will be provided by the bride and groom.'
  };

  // ==========================================
  // 5. SHARED ITEM STYLE GUIDANCE
  // ==========================================

  // These blurbs are coded once and reused for
  // every matching item in the spreadsheet.

  const ITEM_GUIDANCE = {
    suit:
      'Choose a well-fitting suit in your assigned color. Fit and cut are flexible; we want you to be comfortable. Where an exact supplier is specified, follow that ordering guidance.',

    dress:
      'Please choose a floor-length dress in your assigned Azazie color and Stretch Satin fabric. Silhouette, neckline, sleeves, and fit are entirely your choice.',

    'button down':
      'Any solid warm-white or soft-ivory long-sleeved button-down is welcome. Brand and fit are your choice.',

    shirt:
      'Any solid warm-white or soft-ivory long-sleeved button-down is welcome. Brand and fit are your choice.',

    tie:
      'Provided by the bride and groom—nothing to purchase.',

    'bow tie':
      'Please follow the assigned color. If marked as provided by us, there is nothing to purchase.',

    'pocket square':
      'Provided by the bride and groom—nothing to purchase.',

    belt:
      'Warm, medium-to-dark cognac or walnut-brown leather is the goal. It does not need to match the shoes exactly; an existing dress-appropriate belt is absolutely fine.',

    shoes:
      'Choose comfortable, dress-appropriate shoes in your assigned color family. Exact shades and styles are flexible; no need to purchase new shoes if you have suitable ones.',

    'dress shoes':
      'Choose comfortable, dress-appropriate shoes in your assigned color family. Exact shades and styles are flexible.',

    jewelry:
      'Gold or champagne-toned accessories are encouraged but not required. We also plan to gift the women in the wedding party an accessory; details to come.',

    accessories:
      'Gold or champagne-toned accessories are encouraged but not required. We also plan to gift the women in the wedding party an accessory; details to come.',

    'hair accessory':
      'Please follow the assigned color if applicable. The bride and groom will provide the flower girl’s burnt-orange hair accessory.',

    suspenders:
      'Choose a comfortable style in the assigned color; final ring bearer outfit is up to the parents.',

    pants:
      'Choose comfortable dress pants in the assigned color; final ring bearer outfit is up to the parents.',

    florals: GENERAL.florals,
    bouquet: GENERAL.florals,
    'boutonniere': GENERAL.florals,
    'boutonnière': GENERAL.florals
  };

  // ==========================================
  // 6. COLOR DESCRIPTIONS
  // ==========================================

  // For items without an exact retailer match.
  // Manufacturer color/fabric names take priority
  // over these approximate digital swatches.

  const COLOR_DESCRIPTIONS = {
    'Slate Grey':
      'A cool, medium-depth slate grey with subtle blue undertones. Close matches are welcome; it need not be identical to the reference.',

    'Matcha':
      'A muted, greyed sage green. For designated Azazie pieces, use the assigned retailer color and fabric rather than matching this screen swatch.',

    'Eucalyptus':
      'A deeper, cooler green than Matcha, with a soft muted finish.',

    'Champagne':
      'A pale, warm cream-beige. Slight variations in warmth are fine.',

    'Burnt Orange':
      'A rich, earthy copper-terracotta rather than bright orange.',

    'English Rose':
      'A muted peach-rose with warm, dusty undertones.',

    'Burgundy':
      'A deep wine red with a muted plum undertone.',

    'Soft Ivory':
      'A gentle warm white, not a stark or blue-toned optical white.',

    'Cognac Brown':
      'Medium-to-dark warm cognac or walnut leather—earthy brown rather than pale tan or orange.',

    'Cream':
      'A light, warm cream with a soft champagne undertone.'
  };

  // ==========================================
  // 7. INTERNAL STATE & UTILITIES
  // ==========================================

  const ITEM_SORT = [
    'suit',
    'dress',
    'pants',
    'shirt',
    'button down',
    'tie',
    'bow tie',
    'pocket square',
    'suspenders',
    'belt',
    'shoes',
    'dress shoes',
    'jewelry',
    'accessories',
    'hair accessory',
    'bouquet',
    'boutonniere',
    'boutonnière',
    'florals'
  ];

  let attireRows = [];

  function normalize(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function field(row, ...names) {
    for (const name of names) {
      const key = Object.keys(row).find(
        k => normalize(k) === normalize(name)
      );

      if (
        key &&
        row[key] !== undefined &&
        row[key] !== null
      ) {
        return row[key];
      }
    }

    return '';
  }

  function splitMulti(value) {
    return Array.isArray(value)
      ? value.map(String).map(s => s.trim()).filter(Boolean)
      : String(value ?? '')
          .split(/[,;]+/)
          .map(s => s.trim())
          .filter(Boolean);
  }

  function colorHex(color) {
    if (!color) return null;

    const key = Object.keys(COLORS).find(
      k => normalize(k) === normalize(color)
    );

    if (key) return COLORS[key];

    const value = String(color).trim();

    return /^#[0-9a-f]{6}$/i.test(value)
      ? value.toUpperCase()
      : null;
  }

  function safeUrl(value) {
    const v = String(value ?? '').trim();

    if (!v) return '';

    try {
      const u = new URL(
        v,
        global.location?.href || 'https://example.org/'
      );

      return ['https:', 'http:'].includes(u.protocol)
        ? u.href
        : '';
    } catch (_) {
      return '';
    }
  }

  function escapeHTML(value) {
    return String(value ?? '').replace(
      /[&<>"']/g,
      c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[c])
    );
  }

  // ==========================================
  // 8. SPREADSHEET ROW PARSING
  // ==========================================

  function parseRow(row, index) {
    const item = String(field(row, 'Item')).trim();
    const color = String(field(row, 'Color')).trim();

    const group = splitMulti(
      field(row, 'Attire Group', 'AttireGroup')
    );

    return {
      id: String(
        field(row, 'Item ID', 'ID') ||
        `attire-${index + 1}`
      ),

      groups: group,
      item,
      color,
      hex: colorHex(color),

      providedBy: String(
        field(row, 'Provided By')
      ).trim(),

      orderLink: safeUrl(
        field(row, 'Order Link')
      ),

      orderWindow: String(
        field(row, 'Order Window')
      ).trim(),

      notes: String(
        field(row, 'Notes', 'Style Notes')
      ).trim(),

      requirement: String(
        field(row, 'Requirement')
      ).trim(),

      imageUrl: safeUrl(
        field(row, 'Image URL')
      ),

      displayOrder:
        Number(field(row, 'Display Order')) || 0
    };
  }

  function setItems(rows) {
    if (!Array.isArray(rows)) {
      throw new TypeError(
        'PartyAttire.setItems expects an array of spreadsheet row objects.'
      );
    }

    attireRows = rows
      .map(parseRow)
      .filter(r => r.groups.length && r.item);

    return attireRows.length;
  }

  function getItems() {
    return attireRows.map(r => ({
      ...r,
      groups: [...r.groups]
    }));
  }

  function configureRole(role, config) {
    ROLE_CONFIG[normalize(role)] = { ...config };
  }

  function configureFloral(key, floral) {
    FLORALS[key] = {
      ...floral,
      colors: [...(floral.colors || [])]
    };
  }

  // ==========================================
  // 9. RESOLVE A PERSON'S ATTIRE GROUP
  // ==========================================

  function getRoleConfig(person) {
    const role = normalize(
      person?.role || person?.Role
    );

    const mapped = ROLE_CONFIG[role] || {};

    const group =
      person?.attireGroup ||
      person?.['Attire Group'] ||
      mapped.group ||
      '';

    const side =
      person?.attireSide ||
      person?.side ||
      mapped.side ||
      'bride';

    return {
      ...mapped,
      group,
      side,

      floral:
        person?.floralKey ||
        mapped.floral ||
        '',

      hairMakeup:
        person?.hairMakeup ??
        mapped.hairMakeup ??
        false
    };
  }

  // ==========================================
  // 10. ITEM DESCRIPTIONS
  // ==========================================

  function getColorDescription(color, item) {
    if (!color) return '';

    // For retailer-matched fabrics, the official
    // color name matters more than a screen swatch.

    const suppliedColor =
      /azazie|birdy grey/i.test(
        `${item?.orderLink || ''} ${item?.notes || ''}`
      );

    if (suppliedColor) {
      return 'Please use the exact color and fabric listed by the linked retailer; digital swatches are only a visual guide.';
    }

    return (
      COLOR_DESCRIPTIONS[color] ||
      (
        colorHex(color)
          ? 'Use this as a visual color reference; small shade variations are welcome.'
          : 'Follow the assigned color guidance or linked product.'
      )
    );
  }

  function itemGuidance(itemName) {
    const key = normalize(itemName);

    if (ITEM_GUIDANCE[key]) {
      return ITEM_GUIDANCE[key];
    }

    if (key.includes('shoe')) {
      return ITEM_GUIDANCE.shoes;
    }

    if (key.includes('shirt')) {
      return ITEM_GUIDANCE.shirt;
    }

    if (key.includes('dress')) {
      return ITEM_GUIDANCE.dress;
    }

    if (key.includes('suit')) {
      return ITEM_GUIDANCE.suit;
    }

    return 'Follow the assigned color and any item-specific notes. Choose a comfortable style unless otherwise indicated.';
  }

  function uniqueColors(names) {
    const seen = new Set();

    return names
      .filter(name => {
        const k = normalize(name);

        if (!name || seen.has(k)) {
          return false;
        }

        seen.add(k);
        return true;
      })
      .map(name => ({
        name,
        hex: colorHex(name)
      }));
  }

  // ==========================================
  // 11. BUILD PERSONALIZED ATTIRE MODEL
  // ==========================================

  function buildForPerson(person = {}) {
    const config = getRoleConfig(person);
    const groupNames = splitMulti(config.group);

    const items = attireRows
      .filter(row =>
        row.groups.some(g =>
          groupNames.some(
            want => normalize(g) === normalize(want)
          )
        )
      )
      .sort(
        (a, b) =>
          (
            a.displayOrder ||
            ITEM_SORT.indexOf(normalize(a.item)) + 100
          ) -
          (
            b.displayOrder ||
            ITEM_SORT.indexOf(normalize(b.item)) + 100
          )
      )
      .map(row => ({
        ...row,

        guidance: itemGuidance(row.item),

        colorDescription:
          getColorDescription(row.color, row),

        isProvided:
          /^(couple|bride\s*(?:&|and|\/)\s*groom|bride|groom)$/i
            .test(row.providedBy)
      }));

    const palette =
      PALETTES[config.side] ||
      PALETTES.bride;

    const floral =
      FLORALS[config.floral] || null;

    const hasColorSensitiveOrders =
      items.some(item =>
        /azazie|birdy\s*grey/i.test(
          `${item.orderLink} ${item.notes}`
        )
      ) ||
      items.some(item =>
        /dress|suit/i.test(item.item)
      );

    return {
      person,
      group: config.group,
      side: config.side,

      headerPalette: {
        title: palette.title,
        colors: uniqueColors(palette.colors)
      },

      outfitPalette: uniqueColors(
        items
          .filter(i =>
            !/bouquet|boutonni[eè]re|floral/i.test(
              i.item
            )
          )
          .map(i => i.color)
      ),

      items,

      floral: floral
        ? {
            ...floral,
            palette: uniqueColors(floral.colors)
          }
        : null,

      intro: GENERAL.intro,
      azazie: GENERAL.azazie,

      orderWarning: hasColorSensitiveOrders
        ? GENERAL.orderWarning
        : null,

      hairMakeup: config.hairMakeup
        ? GENERAL.hairMakeup
        : null,

      floralNotice: GENERAL.florals
    };
  }

  // ==========================================
  // 12. HTML PRESENTATION HELPERS
  // ==========================================

  function swatches(colors) {
    return `
      <div class="attire-swatches">
        ${colors.map(c => `
          <span
            class="attire-swatch"
            title="${escapeHTML(c.name)}"
          >
            <span
              class="attire-swatch-dot"
              style="background:${c.hex || '#eee'}"
            ></span>
            <span>${escapeHTML(c.name)}</span>
          </span>
        `).join('')}
      </div>
    `;
  }

  // ==========================================
  // 13. RENDER FULL ATTIRE SECTION
  // ==========================================

  function render(element, model) {
    if (!element) {
      throw new Error(
        'PartyAttire.render requires a target element.'
      );
    }

    if (!model) {
      throw new Error(
        'PartyAttire.render requires a model from buildForPerson().'
      );
    }

    const itemCards = model.items.length
      ? model.items.map(i => `
        <article class="attire-item">

          <div class="attire-item-heading">
            <h4>${escapeHTML(i.item)}</h4>

            ${i.color ? `
              <span class="attire-color-label">

                ${i.hex ? `
                  <span
                    class="attire-inline-dot"
                    style="background:${i.hex}"
                  ></span>
                ` : ''}

                ${escapeHTML(i.color)}
              </span>
            ` : ''}
          </div>

          ${i.guidance ? `
            <p>${escapeHTML(i.guidance)}</p>
          ` : ''}

          ${i.colorDescription ? `
            <p class="attire-color-description">
              ${escapeHTML(i.colorDescription)}
            </p>
          ` : ''}

          ${i.notes ? `
            <p class="attire-item-note">
              <strong>For your outfit:</strong>
              ${escapeHTML(i.notes)}
            </p>
          ` : ''}

          ${i.providedBy ? `
            <p class="attire-provider">
              <strong>
                ${i.isProvided
                  ? 'Provided for you'
                  : 'Provided by'}:
              </strong>
              ${escapeHTML(i.providedBy)}
            </p>
          ` : ''}

          ${i.orderWindow ? `
            <p class="attire-order-window">
              <strong>Order window:</strong>
              ${escapeHTML(i.orderWindow)}
            </p>
          ` : ''}

          ${i.orderLink ? `
            <p>
              <a
                href="${escapeHTML(i.orderLink)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                View item / ordering options ↗
              </a>
            </p>
          ` : ''}

          ${i.requirement ? `
            <p class="attire-requirement">
              ${escapeHTML(i.requirement)}
            </p>
          ` : ''}

        </article>
      `).join('')

      : '<p>Attire details are being finalized. Please check back soon!</p>';

    element.innerHTML = `
      <section
        class="party-attire"
        aria-label="Your wedding attire"
      >

        <!-- SIDE COLOR PALETTE -->

        <header class="attire-header">
          <p class="attire-eyebrow">
            Wedding party color story
          </p>

          <h2>
            ${escapeHTML(model.headerPalette.title)}
          </h2>

          ${swatches(model.headerPalette.colors)}
        </header>

        <!-- INTRODUCTION -->

        <p class="attire-intro">
          ${escapeHTML(model.intro)}
        </p>

        <!-- PERSONAL OUTFIT -->

        <section class="attire-outfit">

          <h3>
            ${escapeHTML(model.group || 'Your outfit')}
          </h3>

          ${model.outfitPalette.length
            ? swatches(model.outfitPalette)
            : ''}

          <div class="attire-items">
            ${itemCards}
          </div>

        </section>

        <!-- ORDERING DISCLAIMER -->

        ${model.orderWarning ? `
          <aside class="attire-order-notice">

            <h3>
              ${escapeHTML(model.orderWarning.title)}
            </h3>

            <p>
              ${escapeHTML(model.orderWarning.text)}
            </p>

          </aside>
        ` : ''}

        <!-- AZAZIE INFORMATION -->

        ${(
          model.items.some(i =>
            /azazie/i.test(
              `${i.orderLink} ${i.notes}`
            )
          ) ||
          /bridesmaid|brideswoman|bridesmen/i.test(
            model.group
          )
        ) ? `
          <section class="attire-azazie">

            <h3>
              ${escapeHTML(model.azazie.title)}
            </h3>

            <p>
              ${escapeHTML(model.azazie.text)}
            </p>

            <p>
              <a
                href="${escapeHTML(model.azazie.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore Azazie ↗
              </a>
            </p>

          </section>
        ` : ''}

        <!-- PERSONAL FLORALS -->

        ${model.floral ? `
          <section class="attire-florals">

            <h3>
              Your ${escapeHTML(model.floral.type)}
            </h3>

            ${swatches(model.floral.palette)}

            <p>
              ${escapeHTML(model.floral.description)}
            </p>

            <p>
              ${escapeHTML(model.floralNotice)}
            </p>

          </section>
        ` : ''}

        <!-- HAIR AND MAKEUP -->

        ${model.hairMakeup ? `
          <section class="attire-hair-makeup">

            <h3>
              ${escapeHTML(model.hairMakeup.title)}
            </h3>

            <p>
              ${escapeHTML(model.hairMakeup.text)}
            </p>

          </section>
        ` : ''}

      </section>
    `;

    return element;
  }

  // ==========================================
  // 14. PUBLIC API
  // ==========================================

  global.PartyAttire = Object.freeze({
    COLORS,
    PALETTES,
    ROLE_CONFIG,
    FLORALS,
    GENERAL,
    ITEM_GUIDANCE,
    COLOR_DESCRIPTIONS,

    setItems,
    getItems,
    configureRole,
    configureFloral,
    getRoleConfig,
    buildForPerson,
    render,
    colorHex,
    splitMulti
  });

})(window);
