/* ============================================================================
 * Blood Crown — Skill Codex & Character Forge Hosted PWA Controller
 * ============================================================================ */
(function () {
  "use strict";

  const DATA = window.BC_DATA;
  if (!DATA) return;

  const STORAGE_KEY = "bc_skill_forge_pwa_v5";
  const LEGACY_STORAGE_KEY = "bc_hero_skill_visualizer_v3";
  const UNDO_LIMIT = 30;

  const TIER_META = [
    { tier: 1, roman: "I", sub: "Opener" },
    { tier: 2, roman: "II", sub: "Core" },
    { tier: 3, roman: "III", sub: "Heavy" },
    { tier: 4, roman: "IV", sub: "Capstone" },
  ];

  const TAG_FILTERS = [
    "All",
    "AoE",
    "Single",
    "Stun/Freeze",
    "Slow",
    "Pierce",
    "DoT",
    "Pull/Hook",
    "Dash",
    "Summon",
  ];

  const SOURCE_GAMES = [
    "ALL",
    "Diablo II",
    "DotA 2",
    "Path of Exile 2",
    "Guild Wars 2",
    "Elden Ring",
    "Last Epoch",
    "V Rising",
    "Bannerlord",
    "Mordhau",
    "Custom",
  ];

  // All 54 bespoke 60fps isometric cast patterns supported by triggerSkillPreview
  const CHOREO_PATTERNS = [
    { id: "rapid_jab_3", label: "Melee · Rapid 3-Thrust Spear Combo" },
    { id: "whirl_sweep_360", label: "Melee · 360° Sweeping Cleave Ring" },
    { id: "whirlwind_spin_path", label: "Melee · Continuous Whirlwind Spin Path" },
    { id: "heavy_overhead_execution", label: "Melee · Crushing Execution Slam" },
    { id: "spellblade_arc_lunge", label: "Melee · Arcane Spellblade Great-Lance" },
    { id: "wall_pin_spear", label: "Control · Heavy Spear Wall-Pin Stun" },
    { id: "harpoon_pull", label: "Control · Harpoon / Meat-Hook Pull" },
    { id: "parry_counter_ward", label: "Defense · Active Parry & Riposte Beam" },
    { id: "pavise_wall_brace", label: "Defense · Braced Pavise Shieldwall" },
    { id: "dash_skewer_line", label: "Mobility · Line Dash Skewer & Burst" },
    { id: "shield_charge_slam", label: "Mobility · Shield Charge Impact Slam" },
    { id: "leap_crater_slam", label: "Mobility · Gap-Closing Crater Slam" },
    { id: "vault_back_shot", label: "Mobility · Vault Strike & Backflip Shot" },
    { id: "blink_teleport_burst", label: "Mobility · Teleport Blink & Arrival Nova" },
    { id: "wolf_pounce_rend", label: "Shapeshift · Dire-Wolf Pounce & Claw Rend" },
    { id: "bear_shockwave_roar", label: "Shapeshift · Iron-Bear Shockwave Maul" },
    { id: "smoke_blind_ambush", label: "Stealth · Smoke Screen & Backstab Ambush" },
    { id: "shadow_clone_decoy", label: "Stealth · Twin Shadow Decoy Doubles" },
    { id: "caltrop_firepot_trap", label: "Trap · Caltrop Slow & Firepot Zone" },
    { id: "multishot_cone_fan", label: "Ranged · Wide Cone Multishot Fan" },
    { id: "powershot_pierce_rail", label: "Ranged · Piercing Rail Skillshot" },
    { id: "homing_seeker_arrow", label: "Ranged · Guided Homing Seeker Shot" },
    { id: "ricochet_bounce", label: "Ranged · Chain Ricochet Bounce" },
    { id: "javelin_split_bolts", label: "Ranged · Lightning Fury Split-Bolt Volley" },
    { id: "charged_bolt_release", label: "Ranged · Charged Lightning Bolt Fan" },
    { id: "poison_javelin_cloud", label: "Ranged · Plague Javelin & Poison Trail" },
    { id: "delayed_detonate_spear", label: "Ranged · Sticky Explosive Spear" },
    { id: "boomerang_axes", label: "Ranged · Curved Twin Boomerang Axes" },
    { id: "stance_axes_toggle", label: "Stance · Dual Spinning Axe Orbit" },
    { id: "frost_arrow_rain", label: "Zone · Chilling Arrow Rain Volley" },
    { id: "frozen_orb_shards", label: "Arcane · Frozen Orb 360° Shard Emitter" },
    { id: "static_nova_ring", label: "Arcane · Expanding Static Shock Nova" },
    { id: "firewall_burn_line", label: "Arcane · Ignited Firewall Line" },
    { id: "meteor_sky_crater", label: "Arcane · Delayed Meteor Crater Impact" },
    { id: "sky_judgment_bolt", label: "Divine · Instant Sky Judgment Bolt" },
    { id: "spiral_hammers_orbit", label: "Divine · Expanding Spiral Hammer Orbit" },
    { id: "gravity_vortex_pull", label: "Control · Gravity Vortex Pull Well" },
    { id: "ice_rampart_wall", label: "Control · Glacial Rampart Barrier Wall" },
    { id: "briar_vine_root", label: "Nature · Entangling Briar Vine Line" },
    { id: "tornado_wandering", label: "Nature · Wandering Storm Funnel" },
    { id: "boulder_bowling", label: "Nature · Rolling Knockback Boulder" },
    { id: "hurricane_eye_aura", label: "Aura · Swirling Hurricane Eye" },
    { id: "stamina_conditioning_aura", label: "Aura · Stamina & Tempo Conditioning" },
    { id: "warcry_roar_rings", label: "Warcry · Dual Roar Shockwave Rings" },
    { id: "sunder_faultline", label: "Slam · Cascading Tectonic Faultline" },
    { id: "tether_siphon_beam", label: "Channel · Drain Siphon Tether Beam" },
    { id: "corpse_chain_explosion", label: "Necro · Sequential Corpse Detonation" },
    { id: "hydra_turret_spit", label: "Summon · Autonomous Hydra Spit Turrets" },
    { id: "lightning_death_sentry", label: "Summon · Arc Lightning & Death Sentries" },
    { id: "falcon_mark_dive", label: "Summon · Hunting Falcon Dive Mark" },
    { id: "skeleton_phalanx_command", label: "Summon · Skeleton Phalanx Advance" },
    { id: "beast_pack_summon", label: "Summon · Dire Wolf Pack Rush" },
    { id: "warband_phalanx_command", label: "Warband · Mercenary Guard Phalanx" },
    { id: "planted_war_banner", label: "Warband · Planted Standard Aura Zone" },
  ];

  // Pristine base skills + merged live lookup map
  const BASE_SKILLS = new Map();
  const ALL_SKILLS = new Map();
  DATA.skillLibrary.forEach((s) => BASE_SKILLS.set(s.id, { ...s }));
  DATA.universalTrees.forEach((ut) =>
    ut.skills.forEach((s) =>
      BASE_SKILLS.set(s.id, {
        ...s,
        originHero: "Universal",
        originHeroId: "universal",
        originTree: ut.name,
        maxRank: s.maxRank || 5,
      })
    )
  );
  BASE_SKILLS.forEach((v, k) => ALL_SKILLS.set(k, { ...v }));

  // Weapon Archetypes, Weapon Mini-Builds, Cross-Game Skill Behavior Modifiers & Master Game Matrix
  const WEAPON_ARCHETYPES = Array.isArray(DATA.weaponArchetypes) ? DATA.weaponArchetypes : [];
  const WEAPON_MINI_BUILDS = Array.isArray(DATA.weaponMiniBuilds) ? DATA.weaponMiniBuilds : [];
  const SKILL_MOD_META = (DATA.skillModifierLibrary && DATA.skillModifierLibrary.meta) || {};
  const SKILL_MODIFIERS = (DATA.skillModifierLibrary && Array.isArray(DATA.skillModifierLibrary.modifiers))
    ? DATA.skillModifierLibrary.modifiers
    : [];
  const GAME_MATRIX = DATA.gameMatrix || {};
  const MOD_BY_ID = new Map(SKILL_MODIFIERS.map((m) => [m.id, m]));
  const WEAPON_ARCH_BY_ID = new Map(WEAPON_ARCHETYPES.map((w) => [w.id, w]));
  const WEAPON_MB_BY_ID = new Map(WEAPON_MINI_BUILDS.map((w) => [w.id, w]));

  // Synthetic previewable skill definitions for all 8 Unique / Runeword Weapon-Granted Skills
  const WEAPON_GRANTED_SKILL_VIZ = {
    wpn_sk_storm_javelin_hurl: {
      icon: "assets/icons/d2r/ama_lightning_fury.png",
      castType: "Weapon Skillshot",
      cooldown: "5.0s",
      resource: "16 Stamina",
      effects: ["Pierce", "Lightning", "Weapon Skill"],
      choreography: { pattern: "javelin_split_bolts", color1: "#6ce0ff", color2: "#ffe07d", count: 6, radius: 2.1, hitStatus: "STORM BOLT!" },
    },
    wpn_sk_bone_lance: {
      icon: "assets/icons/d2r/nec_bone_spear.png",
      castType: "Weapon Skillshot",
      cooldown: "2.5s",
      resource: "14 Mana",
      effects: ["Pierce", "Spell", "Weapon Skill"],
      choreography: { pattern: "powershot_pierce_rail", color1: "#e6effa", color2: "#8ef5d4", count: 1, radius: 1.8, hitStatus: "MARROW PIERCE!" },
    },
    wpn_sk_phantom_whirl: {
      icon: "assets/icons/d2r/ass_blade_fury.png",
      castType: "Weapon Spin Dash",
      cooldown: "4.5s",
      resource: "18 Stamina",
      effects: ["AoE", "Dash", "Bleed", "Weapon Skill"],
      choreography: { pattern: "whirlwind_spin_path", color1: "#c77dff", color2: "#ff5c7c", count: 4, radius: 2.0, hitStatus: "VIPER SLASH!" },
    },
    wpn_sk_glacier_stake: {
      icon: "assets/icons/d2r/ama_freezing_arrow.png",
      castType: "Weapon Heavy Bolt",
      cooldown: "5.5s",
      resource: "18 Stamina",
      effects: ["Pierce", "Chill", "Knockback", "Weapon Skill"],
      choreography: { pattern: "wall_pin_spear", color1: "#7ce4ff", color2: "#ffffff", count: 1, radius: 1.9, hitStatus: "GLACIER PIN!" },
    },
    wpn_sk_thunder_jav_bolt: {
      icon: "assets/icons/d2r/ama_lightning_strike.png",
      castType: "Weapon Chain Hurl",
      cooldown: "4.5s",
      resource: "15 Stamina",
      effects: ["Chain", "Lightning", "Weapon Skill"],
      choreography: { pattern: "javelin_split_bolts", color1: "#5be7ff", color2: "#fff29b", count: 5, radius: 2.0, hitStatus: "STORM FORK!" },
    },
    wpn_sk_butcher_chop: {
      icon: "assets/icons/d2r/bar_berserk.png",
      castType: "Weapon Heavy Cleave",
      cooldown: "4.0s",
      resource: "16 Stamina",
      effects: ["AoE", "Melee", "Execute", "Weapon Skill"],
      choreography: { pattern: "whirl_sweep_360", color1: "#ff6b6b", color2: "#ffd166", count: 1, radius: 2.2, hitStatus: "GRIEF CHOP!" },
    },
    wpn_sk_sanctum_bell: {
      icon: "assets/icons/d2r/pal_blessed_hammer.png",
      castType: "Weapon Concussive Slam",
      cooldown: "4.5s",
      resource: "16 Stamina",
      effects: ["Slam", "Stun", "Armor Pen", "Weapon Skill"],
      choreography: { pattern: "sunder_faultline", color1: "#ffd166", color2: "#ffffff", count: 3, radius: 2.0, hitStatus: "SANCTUM CRUSH!" },
    },
    wpn_sk_gale_arrow: {
      icon: "assets/icons/d2r/ama_multiple_shot.png",
      castType: "Weapon Gale Shot",
      cooldown: "3.8s",
      resource: "14 Stamina",
      effects: ["Projectile", "Knockback", "Weapon Skill"],
      choreography: { pattern: "powershot_pierce_rail", color1: "#80ed99", color2: "#ffe07d", count: 1, radius: 1.8, hitStatus: "GALE KNOCKBACK!" },
    },
  };

  const WEAPON_GRANTED_SKILLS = new Map();
  WEAPON_MINI_BUILDS.forEach((wmb) => {
    const gs = wmb && wmb.grantedSkill;
    if (!gs || !gs.skillId) return;
    const vizCfg = WEAPON_GRANTED_SKILL_VIZ[gs.skillId] || WEAPON_GRANTED_SKILL_VIZ.wpn_sk_storm_javelin_hurl;
    WEAPON_GRANTED_SKILLS.set(gs.skillId, {
      id: gs.skillId,
      name: gs.name,
      tier: 4,
      maxRank: 1,
      kind: "Weapon Granted",
      castType: vizCfg.castType,
      cooldown: vizCfg.cooldown,
      resource: vizCfg.resource,
      effects: vizCfg.effects,
      mechanic: gs.baseBehavior,
      bcExactInteraction: gs.baseBehavior,
      origGameSkillName: wmb.d2Inspiration || wmb.name,
      origHowItWorked: wmb.buildFantasySummary || gs.baseBehavior,
      similarTo: wmb.d2Inspiration || "Diablo II Runeword / Unique",
      primaryOrigin: "Diablo II",
      originHero: "Weapon Mini-Build",
      originHeroId: "weapon_minibuild",
      originTree: wmb.name,
      icon: (window.BC_ICON_B64 && window.BC_ICON_B64[vizCfg.icon]) || vizCfg.icon,
      choreography: vizCfg.choreography,
      modifierChoiceIds: (gs.modifierChoices || []).map((c) => c.modifierId).filter(Boolean),
      isWeaponGranted: true,
      weaponMiniBuildId: wmb.id,
    });
  });

  function getModifier(modId) {
    return modId ? MOD_BY_ID.get(modId) || null : null;
  }

  function getWeaponArchetype(archId) {
    return (archId && WEAPON_ARCH_BY_ID.get(archId)) || WEAPON_ARCHETYPES[0] || null;
  }

  function getWeaponMiniBuild(wmbId) {
    return wmbId ? WEAPON_MB_BY_ID.get(wmbId) || null : null;
  }

  function inferWeaponArchetypeForText(weaponsText, heroId) {
    const t = String(weaponsText || "").toLowerCase();
    if (/halberd|polearm|pollaxe|scythe|glaive/.test(t)) return "polearm_2h";
    if (/javelin|spear|pike|lance/.test(t)) return "spear_javelin";
    if (/crossbow|arbalest|wristbow/.test(t)) return "crossbow_2h";
    if (/bow|longbow|shortbow/.test(t)) return "bow_2h";
    if (/dagger|claw|katar|talon|stiletto/.test(t)) return "dagger_claw";
    if (/mace|hammer|flail|maul|scepter|blunt|bear/.test(t)) return "mace_hammer";
    if (/axe|hatchet|francisca/.test(t)) return "axe_1h_2h";
    if (/staff|wand|orb|tome|focus|cryo|pyre/.test(t)) return "staff_wand_focus";
    if (/shield|buckler|targe|pavise/.test(t)) return "shield_offhand";
    if (/sword|blade|rapier|greatsword/.test(t)) return "sword_1h_2h";
    const byHero = {
      huntress: "spear_javelin",
      magister: "staff_wand_focus",
      gravekeeper: "staff_wand_focus",
      bastion: "shield_offhand",
      ravager: "axe_1h_2h",
      wildwarden: "mace_hammer",
      nightblade: "dagger_claw",
    };
    return byHero[heroId] || "sword_1h_2h";
  }

  function getCompatibleModifiersForSkill(sk) {
    if (!sk || !SKILL_MODIFIERS.length) return { isPassive: false, curated: [], all: [] };
    if (String(sk.kind || "").toLowerCase() === "passive") {
      return { isPassive: true, curated: [], all: [] };
    }
    const curatedIds = Array.isArray(sk.modifierChoiceIds) ? sk.modifierChoiceIds : [];
    const curated = curatedIds.map((id) => MOD_BY_ID.get(id)).filter(Boolean);

    const hay = [
      sk.name,
      sk.castType,
      sk.damageType,
      (sk.effects || []).join(" "),
      sk.mechanic,
      sk.bcExactInteraction,
      sk.choreography && sk.choreography.pattern,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const derivedTags = new Set();
    if (/proj|arrow|bolt|shot|orb|shard|jav|throw|lance/.test(hay)) derivedTags.add("projectile");
    if (/bow|arrow|volley|multishot/.test(hay)) derivedTags.add("bow");
    if (/throw|javelin|boomerang|hatchet/.test(hay)) derivedTags.add("throw");
    if (/spear|lance|pike|thrust|jab|skewer|impale/.test(hay)) {
      derivedTags.add("spear");
      derivedTags.add("thrust");
      derivedTags.add("pierce");
    }
    if (/melee|slash|cleave|whirl|claw|scythe|strike|slam|maul/.test(hay)) derivedTags.add("melee");
    if (/slash|cleave|whirl|scythe|claw|blade|sword|axe/.test(hay)) derivedTags.add("slash");
    if (/slam|crater|maul|hammer|crush|shockwave|sunder/.test(hay)) derivedTags.add("slam");
    if (/aoe|nova|cone|rain|zone|cloud|vortex|whirl|explosion|corpse/.test(hay)) derivedTags.add("aoe");
    if (/spell|arcane|fire|frost|ice|cryo|lightning|static|bone|meteor|orb|siphon/.test(hay)) derivedTags.add("spell");
    if (/summon|sentry|hydra|turret|trap|skeleton|wolf|warband|banner|totem/.test(hay)) {
      derivedTags.add("summon");
      derivedTags.add("sentry");
      derivedTags.add("trap");
    }
    if (/dash|leap|vault|blink|charge|mobility/.test(hay)) derivedTags.add("dash");
    if (sk.cooldown && !/none|^0/i.test(sk.cooldown)) derivedTags.add("cooldown");
    derivedTags.add("strike");

    const scored = SKILL_MODIFIERS.map((m) => {
      let score = curatedIds.includes(m.id) ? 50 : 0;
      (m.compatibleTags || m.appliesToTags || []).forEach((tg) => {
        if (derivedTags.has(tg)) score += 10;
      });
      return { mod: m, score };
    }).sort((a, b) => b.score - a.score);

    const top3 = curated.length >= 3 ? curated.slice(0, 3) : [];
    for (const item of scored) {
      if (top3.length >= 3) break;
      if (!top3.some((x) => x.id === item.mod.id)) top3.push(item.mod);
    }
    return {
      isPassive: false,
      curated: top3,
      all: scored.map((x) => x.mod),
    };
  }

  // ==========================================================================
  // BLOOD CROWN DETERMINISTIC COMBAT & TWO-BOX PACING ENGINE (1:1 WITH bc_engine.py)
  // ==========================================================================
  const matrixState = {
    subTab: "sim", // "sim" | "pacing" | "oracle" | "rules"
    level: 30,
    gearTier: "mid", // "starter" | "mid" | "endgame"
    targetTier: "standard", // "trash" | "standard" | "brute" | "elite" | "boss" | "pvp_duel"
    useBuildSkillRank: false,
    pacingOverrides: {},
  };

  function bcCurveCfg() {
    return GAME_MATRIX.curve || {
      powerBaseL1: 12.0,
      growthPerLevel: 0.045,
      heroHpToPowerRatio: 3.9,
      vitalityHpCapPct: 35,
      glancingUnderlevelDelta: 5,
      glancingDamageMult: 0.65,
    };
  }

  function bcCombatRulesCfg() {
    return GAME_MATRIX.combatRules || {
      hitChanceContactPct: 100,
      sprintKeepsFullArmor: true,
      armorDrCapPct: 60,
      resistCapPct: 60,
      monsterMaxResistPct: 50,
      allowMonsterImmunity: false,
      actionSpeedGearCapPct: 40,
      additiveDamageCapPct: 120,
      critDamageMult: 1.5,
      poiseFlinchMaxHpPct: 12.0,
      poiseFlinchDurationMs: 280,
      poiseImmunityWindowMs: 1200,
      pvpDamageScalar: 0.88,
      pvpEngagementUptime: 0.62,
      pvpDownedReviveWindowSec: 20.0,
      tooltipMaxLines: 6,
    };
  }

  function bcGearTierCfg(gearTier) {
    const tiers = GAME_MATRIX.tierPresets || {
      starter: { label: "Starter / Campaign Normal", additiveDamagePct: 15, actionSpeedPct: 8, armorDrPct: 14, resistPct: 15, critChancePct: 6, vitalityBonusPct: 8 },
      mid: { label: "Mid-Tier / Tuned Rare + Crafted", additiveDamagePct: 55, actionSpeedPct: 22, armorDrPct: 32, resistPct: 38, critChancePct: 14, vitalityBonusPct: 18 },
      endgame: { label: "Endgame / Chase Runeword + Socketed", additiveDamagePct: 110, actionSpeedPct: 38, armorDrPct: 52, resistPct: 58, critChancePct: 24, vitalityBonusPct: 32 },
    };
    return tiers[gearTier] || tiers.mid;
  }

  function bcBaseWeaponPower(level) {
    const c = bcCurveCfg();
    const lvl = Math.max(1, Math.min(99, Math.round(level || 30)));
    return Number(c.powerBaseL1) * Math.pow(1 + Number(c.growthPerLevel), lvl - 1);
  }

  function bcExpectedCampaignGearMult(level) {
    const lvl = Math.max(1, Math.min(99, Math.round(level || 30)));
    const st = bcGearTierCfg("starter");
    const md = bcGearTierCfg("mid");
    const eg = bcGearTierCfg("endgame");
    const rules = bcCombatRulesCfg();
    let dmgPct = 0;
    let critPct = 0;
    if (lvl <= 30) {
      const frac = (lvl - 1) / 29.0;
      dmgPct = st.additiveDamagePct + frac * (md.additiveDamagePct - st.additiveDamagePct);
      critPct = st.critChancePct + frac * (md.critChancePct - st.critChancePct);
    } else {
      const frac = Math.min(1.0, (lvl - 30) / 60.0);
      const endAnchorDmg = md.additiveDamagePct + 0.62 * (eg.additiveDamagePct - md.additiveDamagePct);
      dmgPct = md.additiveDamagePct + frac * (endAnchorDmg - md.additiveDamagePct);
      critPct = md.critChancePct + frac * 6.0;
    }
    const critMult = 1.0 + (critPct / 100.0) * (Number(rules.critDamageMult) - 1.0);
    return (1.0 + dmgPct / 100.0) * critMult;
  }

  function bcHeroMaxHp(level, gearTier) {
    const c = bcCurveCfg();
    const g = bcGearTierCfg(gearTier || "mid");
    const power = bcBaseWeaponPower(level);
    const vitBonus = Math.min(Number(c.vitalityHpCapPct), Number(g.vitalityBonusPct)) / 100.0;
    return Math.max(50, Math.round(power * Number(c.heroHpToPowerRatio) * bcExpectedCampaignGearMult(level) * (1.0 + vitBonus)));
  }

  function bcMonsterStats(level, tierId) {
    const htkMap = GAME_MATRIX.htkTargets || {
      trash: { label: "Swarm / Trash", targetHits: 3, boxHits: [2, 4], targetSeconds: 1.5, boxSeconds: [0.8, 2.5], mobArmorDrPct: 5, mobResistPct: 0, mobHitHeroHpPct: 7.5 },
      standard: { label: "Standard Pack Trooper", targetHits: 5, boxHits: [4, 6.5], targetSeconds: 2.8, boxSeconds: [1.8, 4.2], mobArmorDrPct: 15, mobResistPct: 15, mobHitHeroHpPct: 12.5 },
      brute: { label: "Heavy Brute", targetHits: 8, boxHits: [6.5, 10.5], targetSeconds: 4.8, boxSeconds: [3.4, 7.0], mobArmorDrPct: 28, mobResistPct: 25, mobHitHeroHpPct: 20.0 },
      elite: { label: "Champion / Elite", targetHits: 12, boxHits: [10, 16], targetSeconds: 8.5, boxSeconds: [6.0, 12.5], mobArmorDrPct: 35, mobResistPct: 35, mobHitHeroHpPct: 26.0 },
      boss: { label: "Act Boss", targetHits: 75, boxHits: [55, 105], targetSeconds: 45.0, boxSeconds: [35.0, 60.0], mobArmorDrPct: 40, mobResistPct: 40, mobHitHeroHpPct: 36.0 },
      pvp_duel: { label: "Equal-Gear PvP Rival", targetHits: 8, boxHits: [6, 10], targetSeconds: 8.2, boxSeconds: [6.0, 11.0], mobArmorDrPct: 32, mobResistPct: 38, mobHitHeroHpPct: 13.5 },
    };
    const tier = htkMap[tierId] || htkMap.standard;
    const lvl = Math.max(1, Math.min(99, Math.round(level || 30)));
    const refGear = lvl < 20 ? "starter" : lvl < 65 ? "mid" : "endgame";
    const heroHpRef = bcHeroMaxHp(lvl, refGear);
    let hp = heroHpRef;
    if (tierId !== "pvp_duel") {
      const expectedRaw = bcBaseWeaponPower(lvl) * 0.82 * bcExpectedCampaignGearMult(lvl);
      const postDr = expectedRaw * (1.0 - Number(tier.mobArmorDrPct) / 100.0);
      hp = Math.max(12, Math.round(postDr * Number(tier.targetHits)));
    }
    const atkDmg = Math.max(2, Math.round(heroHpRef * (Number(tier.mobHitHeroHpPct) / 100.0)));
    return {
      tierId: tierId || "standard",
      label: tier.label,
      level: lvl,
      hp,
      armorDrPct: Number(tier.mobArmorDrPct),
      resistPct: Number(tier.mobResistPct),
      attackDamage: atkDmg,
      targetHits: Number(tier.targetHits),
      boxHits: tier.boxHits || [4, 6.5],
      targetSeconds: Number(tier.targetSeconds),
      boxSeconds: tier.boxSeconds || [1.8, 4.2],
    };
  }

  function bcGradeFromDev(dev) {
    const a = Math.abs(Number(dev) || 0);
    return a < 0.7 ? "in box" : a <= 1.0 ? "near edge" : "out";
  }

  function bcBandMeasure(val, lo, hi) {
    const half = (hi - lo) / 2.0;
    const dev = half ? (val - (lo + hi) / 2.0) / half : 0.0;
    return { dev: Number(dev.toFixed(3)), dist: Number(Math.abs(dev).toFixed(3)), grade: bcGradeFromDev(dev) };
  }

  function buildSixLineWeaponTooltip(level, wArch, gear, mSim, swingPower, wmb) {
    const lines = [
      wmb ? `${wmb.name} · ${wArch.name}` : `Bloodforged ${wArch.name}`,
      `Weapon Power: ${Math.round(swingPower)}  (Item Lvl ${level} · ${wArch.attacksPerSec}/s · ${wArch.reachMeters}m)`,
      `Auto Geometry: ${wArch.autoAttackBehavior}`,
      `+${gear.additiveDamagePct}% Additive Damage · +${gear.actionSpeedPct}% Action Speed`,
      `+${gear.critChancePct}% Crit Chance (1.5×) · 100% Contact Hit (Zero AR)`,
    ];
    if (wmb && wmb.grantedSkill) {
      lines.push(`★ Weapon Skill: [${wmb.grantedSkill.name}]${mSim && mSim.label !== "Unmodified Base Skill" ? ` + ${mSim.label}` : ""}`);
    } else if (mSim && mSim.label !== "Unmodified Base Skill") {
      lines.push(`⚡ Socketed Mutator: [${mSim.label}]`);
    } else {
      lines.push(`⚡ Open Rank-4 Mutator Socket ([A / B / C] Behavior Choice)`);
    }
    return lines.slice(0, 6);
  }

  function evalBcCombat(opts) {
    const o = opts || {};
    const level = Math.max(1, Math.min(99, Math.round(o.level || matrixState.level || 30)));
    const gearTier = o.gearTier || matrixState.gearTier || "mid";
    const targetTier = o.targetTier || matrixState.targetTier || "standard";
    const weaponId = o.weaponId || "polearm_2h";
    const modifierId = o.modifierId || "none";
    const skillDamageMult = typeof o.skillDamageMult === "number" ? o.skillDamageMult : 1.05;

    const rules = bcCombatRulesCfg();
    const gear = bcGearTierCfg(gearTier);
    const wArch = getWeaponArchetype(weaponId) || {
      id: "polearm_2h",
      name: "2H Polearm / Halberd",
      reachMeters: 3.1,
      attacksPerSec: 1.25,
      powerMultiplierPerSwing: 1.45,
      autoAttackBehavior: "Wide 140° sweeping arc",
    };
    const wSimMap = GAME_MATRIX.weaponSimRules || {};
    const wSim = wSimMap[wArch.id] || wSimMap.sword_1h_2h || { maxTargets: 2, secondaryMult: 0.75, armorPenPct: 0, poiseBonusMult: 1.0, sweetspotNote: "" };
    const mSimMap = GAME_MATRIX.modifierSimRules || {};
    const mSim = mSimMap[modifierId] || mSimMap.none || { label: "Unmodified Base Skill", dmgMult: 1.0, speedMult: 1.0, packTargets: null, secondaryMult: null, armorPenAdd: 0, poiseMult: 1.0, cooldownSec: 0 };

    const wpnPower = bcBaseWeaponPower(level);
    const swingMult = Number(wArch.powerMultiplierPerSwing || 1.0);
    const baseAps = Number(wArch.attacksPerSec || 1.5);
    const addDmgMult = 1.0 + Math.min(Number(rules.additiveDamageCapPct), Number(gear.additiveDamagePct)) / 100.0;
    const critMultAvg = 1.0 + (Number(gear.critChancePct) / 100.0) * (Number(rules.critDamageMult) - 1.0);
    const actionSpeedPct = Math.min(Number(rules.actionSpeedGearCapPct), Number(gear.actionSpeedPct));

    let effectiveAps = baseAps * (1.0 + actionSpeedPct / 100.0) * Number(mSim.speedMult || 1.0);
    if (Number(mSim.cooldownSec) > 0) {
      effectiveAps *= 1.0 / (1.0 + 0.12 * Number(mSim.cooldownSec));
    }

    const rawHit = wpnPower * swingMult * skillDamageMult * Number(mSim.dmgMult || 1.0) * addDmgMult * critMultAvg;
    const defender = bcMonsterStats(level, targetTier);
    const armorPen = Math.min(100, Number(wSim.armorPenPct || 0) + Number(mSim.armorPenAdd || 0));
    const effDrPct = Math.min(Number(rules.armorDrCapPct), Math.max(0, defender.armorDrPct * (1.0 - armorPen / 100.0)));
    const pvpMult = targetTier === "pvp_duel" ? Number(rules.pvpDamageScalar) : 1.0;
    const finalHit = Math.max(1.0, rawHit * (1.0 - effDrPct / 100.0) * pvpMult);

    const hitsToKill = Math.max(1, Math.ceil(defender.hp / finalHit));
    const contactLead = 0.26;
    const cadenceAps = effectiveAps * (targetTier === "pvp_duel" ? Number(rules.pvpEngagementUptime) : 1.0);
    const secondsToKill = Number((contactLead + Math.max(0, hitsToKill - 1) / Math.max(0.25, cadenceAps)).toFixed(2));

    const packSize = 5;
    const targetsPerSwing = Math.max(1, Math.min(packSize, mSim.packTargets != null ? Number(mSim.packTargets) : Number(wSim.maxTargets || 1)));
    const secMult = mSim.secondaryMult != null ? Number(mSim.secondaryMult) : Number(wSim.secondaryMult || 0.7);
    const effPackMult = 1.0 + Math.max(0, targetsPerSwing - 1) * secMult;
    const packSwings = Math.max(1, Math.ceil((defender.hp * packSize) / Math.max(1.0, finalHit * effPackMult)));
    const packSecondsToClear5 = Number((contactLead + Math.max(0, packSwings - 1) / Math.max(0.25, effectiveAps)).toFixed(2));

    const poisePctHp = Number((((finalHit * Number(wSim.poiseBonusMult || 1.0) * Number(mSim.poiseMult || 1.0)) / defender.hp) * 100.0).toFixed(1));
    const triggersPoiseFlinch = poisePctHp >= Number(rules.poiseFlinchMaxHpPct);

    const boxArr = targetTier === "boss" ? defender.boxSeconds : defender.boxHits;
    const checkVal = targetTier === "boss" ? secondsToKill : hitsToKill;
    const inTargetBox = checkVal >= boxArr[0] && checkVal <= boxArr[1];
    const bm = bcBandMeasure(checkVal, boxArr[0], boxArr[1]);

    const heroHp = bcHeroMaxHp(level, gearTier);
    const heroDr = Math.min(Number(rules.armorDrCapPct), Number(gear.armorDrPct));
    const mobHitAfterDr = Math.max(1.0, defender.attackDamage * (1.0 - heroDr / 100.0));
    const heroHitsToDie = Math.max(1, Math.ceil(heroHp / mobHitAfterDr));

    return {
      level,
      gearTier,
      gearLabel: gear.label,
      targetTier,
      targetLabel: defender.label,
      weaponId: wArch.id,
      weaponName: wArch.name,
      reachMeters: wArch.reachMeters,
      autoAttackBehavior: wArch.autoAttackBehavior,
      maxTargetsBase: Number(wSim.maxTargets || 1),
      secondaryMultBase: Number(wSim.secondaryMult || 0.7),
      sweetspotNote: wSim.sweetspotNote || "",
      modifierId,
      modifierLabel: mSim.label,
      heroMaxHp: heroHp,
      heroArmorDrPct: heroDr,
      heroHitsToDie,
      weaponPower: Number(wpnPower.toFixed(1)),
      swingPower: Number((wpnPower * swingMult).toFixed(1)),
      effectiveAps: Number(effectiveAps.toFixed(2)),
      hitChancePct: Number(rules.hitChanceContactPct),
      targetMaxHp: defender.hp,
      effectiveTargetDrPct: Number(effDrPct.toFixed(1)),
      finalHitDamage: Number(finalHit.toFixed(1)),
      hitsToKill,
      secondsToKill,
      packTargetsPerSwing: targetsPerSwing,
      packSwingsToClear5: packSwings,
      packSecondsToClear5,
      poiseHitPctMaxHp: poisePctHp,
      poiseThresholdPct: Number(rules.poiseFlinchMaxHpPct),
      triggersPoiseFlinch,
      targetBox: boxArr,
      inTargetBox,
      paceDistance: bm.dist,
      paceGrade: bm.grade,
      tooltip6Lines: buildSixLineWeaponTooltip(level, wArch, gear, mSim, wpnPower * swingMult, o.wmb || null),
    };
  }

  function evaluateLivePacingMatrix() {
    const rows15 = Array.isArray(GAME_MATRIX.pacingRows15) ? GAME_MATRIX.pacingRows15 : [];
    const ovr = matrixState.pacingOverrides || {};
    let weightedSqSum = 0;
    let weightSum = 0;
    let coreOut = false;
    const rows = rows15.map((r) => {
      const val = ovr[r.id] != null ? Number(ovr[r.id]) : Number(r.bcValue);
      const isCore = String(r.box || "").startsWith("Box 1") || r.id === "standard_mob_htk" || r.id === "pvp_duel_ttk";
      let dev = 0;
      let targetText = "";
      if (r.ruleKind === "band") {
        const lo = Number(r.bandLow != null ? r.bandLow : r.bandMin);
        const hi = Number(r.bandHigh != null ? r.bandHigh : r.bandMax);
        const half = (hi - lo) / 2.0;
        dev = half ? (val - (lo + hi) / 2.0) / half : 0;
        targetText = `${lo} .. ${hi} ${r.unit}`;
      } else {
        const cap = Number(r.capMax || 1.0);
        dev = cap ? val / cap : 0;
        targetText = `≤ ${cap} ${r.unit}`;
      }
      const grade = bcGradeFromDev(dev);
      const w = isCore ? 3 : 1;
      weightedSqSum += w * dev * dev;
      weightSum += w;
      if (isCore && grade === "out") coreOut = true;
      return {
        ...r,
        measuredValue: Number(val.toFixed(2)),
        targetRangeText: targetText,
        distance: Number(Math.abs(dev).toFixed(3)),
        grade,
        isCore,
      };
    });
    const dist = weightSum ? Math.sqrt(weightedSqSum / weightSum) : 0;
    return {
      paceDistance: Number(dist.toFixed(3)),
      overallGrade: coreOut ? "out" : bcGradeFromDev(dist),
      inBoxCount: rows.filter((x) => x.grade === "in box").length,
      nearEdgeCount: rows.filter((x) => x.grade === "near edge").length,
      outCount: rows.filter((x) => x.grade === "out").length,
      rows,
    };
  }

  // Image cache for Canvas drawing (hero portrait / skill icon floating badge)
  const imgCache = new Map();
  function getCachedImg(src) {
    if (!src) return null;
    if (imgCache.has(src)) return imgCache.get(src);
    const im = new Image();
    im.src = src;
    imgCache.set(src, im);
    return im;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function isHostedWebContext() {
    return !window.BC_STANDALONE && window.location.protocol.startsWith("http");
  }

  function isStaticGitHubPages() {
    return /\.github\.io$/i.test(window.location.hostname || "");
  }

  function canUseServerSync() {
    return isHostedWebContext() && !isStaticGitHubPages();
  }

  // Catalog helpers with graceful standalone fallback
  function getPortraitCatalog() {
    const raw = (DATA.assetCatalog && DATA.assetCatalog.portraits) || [];
    if (raw.length) return raw;
    const seen = new Set();
    const out = [];
    DATA.heroes.forEach((h) => {
      if (h.portrait && !seen.has(h.portrait)) {
        seen.add(h.portrait);
        out.push({ id: h.id, label: h.name, path: h.portrait });
      }
    });
    return out;
  }

  function getIconCatalog() {
    const raw = (DATA.assetCatalog && DATA.assetCatalog.icons) || [];
    if (raw.length) return raw;
    const seen = new Set();
    const out = [];
    BASE_SKILLS.forEach((sk) => {
      if (sk.icon && !seen.has(sk.icon)) {
        seen.add(sk.icon);
        out.push({
          id: sk.id,
          label: sk.name,
          group: sk.originHero || "Blood Crown",
          path: sk.icon,
        });
      }
    });
    return out;
  }

  function showToast(msg) {
    const host = document.getElementById("toastHost");
    if (!host) return;
    const el = document.createElement("div");
    el.className = "toast-msg";
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transition = "opacity 0.22s ease";
      setTimeout(() => el.remove(), 240);
    }, 2600);
  }

  // ==========================================================================
  // 1. STATE, UNDO/REDO STACK & DUAL PERSISTENCE (LOCAL + SERVER API)
  // ==========================================================================
  let undoStack = [];
  let redoStack = [];
  let syncDebounceTimer = null;
  let deferredInstallPrompt = null;

  // Transient UI filter/editor state
  let targetSlot = null; // { treeIdx, tier, col } | null
  let paletteState = {
    search: "",
    game: "ALL",
    hero: "ALL",
    tag: "All",
  };
  let codexState = {
    tab: "skills", // "skills" | "modifiers" | "weapons"
    modCategory: "ALL",
    search: "",
    game: "ALL",
    hero: "ALL",
    tag: "All",
  };
  let showAllModsInInspector = false;
  let mobDockDetailsOpen = false;
  let arenaReturnOrigin = {
    sourceType: "tree", // "tree" | "builds" | "skills" | "codex"
    mobileTab: "tree",
    desktopFromCodex: false,
    codexTab: "skills",
    treeTab: "tree1",
    skillId: "",
  };
  let wizardCtx = {
    mode: "create", // "create" | "edit"
    editHeroId: null,
    selectedPortrait: "assets/portraits/amazonicon.png",
  };
  let nodeEditorCtx = {
    mode: "slot", // "slot" | "skill" | "create"
    treeIdx: 0,
    tier: 1,
    col: 0,
    skillId: null,
    selectedIcon: "assets/icons/d2r/ama_jab.png",
  };

  function normalizeCustomSkillsMap(rawCustomSkills) {
    const out = {};
    if (Array.isArray(rawCustomSkills)) {
      rawCustomSkills.forEach((cs) => {
        if (cs && cs.id) out[cs.id] = cs;
      });
    } else if (rawCustomSkills && typeof rawCustomSkills === "object") {
      Object.keys(rawCustomSkills).forEach((k) => {
        const v = rawCustomSkills[k];
        if (v && typeof v === "object") out[k] = { ...v, id: v.id || k };
      });
    }
    return out;
  }

  const MAX_SKILL_POINTS = 110;

  function formatCombatIdentity(ci) {
    if (!ci) return "Custom Blood Crown isometric ARPG kit.";
    if (typeof ci === "string") return ci;
    if (typeof ci === "object") {
      const weaps = Array.isArray(ci.weapons) ? ci.weapons.join(" · ") : ci.weapons || "";
      return [ci.role, weaps ? `Arms: ${weaps}` : "", ci.signatureMechanic].filter(Boolean).join(" — ");
    }
    return String(ci);
  }

  function normalizeMode(m) {
    if (m === "builds") return "builds";
    if (m === "codex") return "codex";
    if (m === "matrix") return "matrix";
    return "trees";
  }

  function isMobileViewport() {
    return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 900px)").matches;
  }

  function normalizeMobileTab(t) {
    return ["tree", "builds", "arena", "matrix", "skills", "heroes"].includes(t) ? t : "tree";
  }

  function getUniversalSkillIdSet() {
    const s = new Set();
    (DATA.universalTrees || []).forEach((ut) => {
      (ut.skills || []).forEach((sk) => s.add(sk.id));
    });
    return s;
  }

  function getHeroAllowedSkillSet(hs) {
    const allowed = getUniversalSkillIdSet();
    (hs.treeGrid || []).forEach((cells) => {
      Object.values(cells || {}).forEach((sid) => {
        if (sid && (ALL_SKILLS.has(sid) || BASE_SKILLS.has(sid))) allowed.add(sid);
      });
    });
    return allowed;
  }

  function treeUsedMatches(treesUsedArr, treeNameOrKey) {
    if (!Array.isArray(treesUsedArr) || !treeNameOrKey) return false;
    const needle = String(treeNameOrKey).toLowerCase();
    const firstWord = needle.split(/[&\s]/)[0].trim();
    return treesUsedArr.some((item) => {
      if (typeof item === "number") return String(item) === needle;
      const hay = String(item || "").toLowerCase();
      return hay === needle || hay.includes(needle) || (firstWord.length >= 4 && hay.includes(firstWord));
    });
  }

  function seedPresetRanksForHero(hero, preset, treeGrid, prereqByTree) {
    const ranks = {};
    let spent = 0;
    const addPts = (sid, want, capTotal = 98) => {
      const sk = sid ? ALL_SKILLS.get(sid) || BASE_SKILLS.get(sid) : null;
      if (!sk) return;
      const maxR = sk.maxRank || 20;
      const cur = ranks[sid] || 0;
      const target = Math.min(maxR, Math.max(cur, want));
      const room = Math.max(0, capTotal - spent);
      const delta = Math.min(room, Math.max(0, target - cur));
      if (delta > 0) {
        ranks[sid] = cur + delta;
        spent += delta;
      }
    };

    const allowedInTrees = new Set(getUniversalSkillIdSet());
    (treeGrid || []).forEach((cells) => {
      Object.values(cells || {}).forEach((sid) => {
        if (sid) allowedInTrees.add(sid);
      });
    });

    // 1. Signature combo rotation skills get prime investment (16-20 pts) + prereq chain
    ((preset && preset.comboSteps) || []).forEach((cs, idx) => {
      const sid = cs && cs.skillId;
      if (!sid || !allowedInTrees.has(sid)) return;
      (treeGrid || []).forEach((cells, ti) => {
        if (Object.values(cells || {}).includes(sid)) {
          let curP = (prereqByTree && prereqByTree[ti] && prereqByTree[ti][sid]) || "";
          const visited = new Set();
          while (curP && !visited.has(curP) && allowedInTrees.has(curP)) {
            visited.add(curP);
            addPts(curP, 2);
            curP = (prereqByTree && prereqByTree[ti] && prereqByTree[ti][curP]) || "";
          }
        }
      });
      addPts(sid, idx < 2 ? 20 : 15);
    });

    // 2. Universal Mobility & Warband synergies (dynamic IDs from DATA.universalTrees)
    const usedList = (preset && preset.treesUsed) || [];
    const usesMobility = treeUsedMatches(usedList, "mobility");
    const usesWarband = treeUsedMatches(usedList, "commander") || treeUsedMatches(usedList, "warband");
    const mobSkills = (DATA.universalTrees && DATA.universalTrees[0] && DATA.universalTrees[0].skills) || [];
    const cmdSkills = (DATA.universalTrees && DATA.universalTrees[1] && DATA.universalTrees[1].skills) || [];
    if (mobSkills[0]) addPts(mobSkills[0].id, usesMobility ? 5 : 3);
    if (usesMobility && mobSkills[1]) addPts(mobSkills[1].id, 3);
    if (cmdSkills[0]) addPts(cmdSkills[0].id, usesWarband ? 5 : 3);
    if (usesWarband && cmdSkills[1]) addPts(cmdSkills[1].id, 3);

    // 3. Supporting skills in emphasized class trees up to 98/110 (leaving 12 pts free to tweak)
    [0, 1, 2].forEach((ti) => {
      const ct = (hero.classTrees && hero.classTrees[ti]) || {};
      const emphasized = treeUsedMatches(usedList, ct.name || "") || usedList.includes(ti + 1);
      if (!emphasized) return;
      const cells = (treeGrid && treeGrid[ti]) || {};
      Object.entries(cells).forEach(([cellKey, sid]) => {
        if (!sid) return;
        const tier = parseInt(cellKey.split("_")[0], 10) || 1;
        addPts(sid, tier === 4 ? 8 : tier === 3 ? 5 : 2);
      });
    });

    return ranks;
  }

  function makeDefaultBuildsForHero(hero, treeGrid, prereqByTree) {
    const presets = hero.presets || [];
    if (presets.length > 0) {
      return presets.map((p, idx) => {
        const seededRanks = seedPresetRanksForHero(hero, p, treeGrid, prereqByTree);
        const rotation = ((p.comboSteps || []).filter((cs) => cs && cs.skillId) || []).map((cs, sIdx) => ({
          skillId: cs.skillId,
          role: cs.role || `${sIdx + 1}. Step ${sIdx + 1}`,
          note: cs.note || "",
        }));
        const seedMods = {};
        if (rotation[0] && rotation[0].skillId) {
          const leadSk = BASE_SKILLS.get(rotation[0].skillId);
          const leadCompat = getCompatibleModifiersForSkill(leadSk);
          if (leadCompat.curated[idx % Math.max(1, leadCompat.curated.length)]) {
            seedMods[rotation[0].skillId] = leadCompat.curated[idx % leadCompat.curated.length].id;
          }
        }
        const archId = inferWeaponArchetypeForText(p.weapons || "", hero.id);
        return {
          id: p.id || `${hero.id}_build_${idx}`,
          name: p.name || `${hero.name} Build ${idx + 1}`,
          archetype: p.type || "Signature Playstyle",
          weapons: p.weapons || "",
          weaponArchetypeId: archId,
          weaponMiniBuildId: "",
          weaponSkillModId: "",
          skillModifiers: seedMods,
          loopNotes: p.loop || "",
          synergyNotes: p.universalSynergy || "",
          ranks: seededRanks,
          rotation,
          isPresetSeeded: true,
        };
      });
    }

    // Blank or custom hero without presets
    const starterIds = [];
    (treeGrid || []).forEach((cells) => {
      Object.values(cells || {}).forEach((sid) => {
        if (sid && starterIds.length < 4 && !starterIds.includes(sid)) starterIds.push(sid);
      });
    });
    const starterWeap = (hero.classTrees && hero.classTrees[0] && hero.classTrees[0].weaponFocus) || "Mixed Arms";
    return [
      {
        id: `${hero.id}_build_custom_1`,
        name: `${hero.name || "Hero"} Starter Build`,
        archetype: "Custom Playstyle",
        weapons: starterWeap,
        weaponArchetypeId: inferWeaponArchetypeForText(starterWeap, hero.id),
        weaponMiniBuildId: "",
        weaponSkillModId: "",
        skillModifiers: {},
        loopNotes: "Spend up to 110 skill points across your 3 class trees + Mobility & Warband, pick a behavior modifier for your core skills, then hit Play Build Combo!",
        synergyNotes: "",
        ranks: { mob_second_wind: 3, cmd_mercenary_levy: 3 },
        rotation: starterIds.map((sid, i) => ({
          skillId: sid,
          role: `${i + 1}. Step ${i + 1}`,
          note: "",
        })),
        isPresetSeeded: false,
      },
    ];
  }

  function makeDefaultHeroState(hero) {
    const prereqByTree = [{}, {}, {}];
    const treeGrid = [0, 1, 2].map((ti) => {
      const cells = {};
      const t = (hero.classTrees && hero.classTrees[ti]) || { skills: [] };
      const usedColsByTier = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
      (t.skills || []).forEach((s) => {
        const tier = Math.min(4, Math.max(1, s.tier || 1));
        let col = typeof s.col === "number" ? Math.min(2, Math.max(0, s.col)) : 1;
        while (usedColsByTier[tier].has(col)) col = (col + 1) % 3;
        usedColsByTier[tier].add(col);
        cells[`${tier}_${col}`] = s.id;
        if (s.prereq) prereqByTree[ti][s.id] = s.prereq;
      });
      return cells;
    });

    const builds = makeDefaultBuildsForHero(hero, treeGrid, prereqByTree);
    const activeBuild = builds[0];

    const firstSkill =
      (hero.classTrees &&
        hero.classTrees[0] &&
        hero.classTrees[0].skills &&
        hero.classTrees[0].skills[0] &&
        hero.classTrees[0].skills[0].id) ||
      DATA.skillLibrary[0].id;

    return {
      heroId: hero.id,
      presetId: activeBuild.id,
      activeBuildId: activeBuild.id,
      builds,
      activeTab: "tree1",
      selectedSkillId: firstSkill,
      treeGrid,
      prereqByTree,
      heroMetaOverride: null,
      treeMetaOverrides: null,
      ranks: activeBuild.ranks,
    };
  }

  function reconcileHeroBuilds(hero, hs) {
    if (!Array.isArray(hs.builds) || hs.builds.length === 0) {
      hs.builds = makeDefaultBuildsForHero(hero, hs.treeGrid, hs.prereqByTree);
      // Migrate any legacy non-zero custom ranks if user had customized ranks before v6
      const legacySum = Object.values(hs.ranks || {}).reduce((a, b) => a + (Number(b) || 0), 0);
      if (legacySum > 10 && !hs.presetId) {
        hs.builds.unshift({
          id: `${hero.id}_migrated_build`,
          name: `${hero.name} Custom Build`,
          archetype: "Saved Custom Build",
          weapons: "",
          weaponArchetypeId: inferWeaponArchetypeForText("", hero.id),
          weaponMiniBuildId: "",
          weaponSkillModId: "",
          skillModifiers: {},
          loopNotes: "Custom skill point allocation.",
          synergyNotes: "",
          ranks: { ...hs.ranks },
          rotation: [],
          isPresetSeeded: false,
        });
      }
    }

    const allowed = getHeroAllowedSkillSet(hs);
    const presets = (hero && hero.presets) || [];
    hs.builds.forEach((b, idx) => {
      if (!b.id) b.id = `${hero.id}_build_${idx}_${Date.now()}`;
      if (!b.name) b.name = `Build ${idx + 1}`;
      if (!b.weaponArchetypeId || !WEAPON_ARCH_BY_ID.has(b.weaponArchetypeId)) {
        b.weaponArchetypeId = inferWeaponArchetypeForText(b.weapons || "", hero.id);
      }
      if (b.weaponMiniBuildId && !WEAPON_MB_BY_ID.has(b.weaponMiniBuildId)) {
        b.weaponMiniBuildId = "";
      }
      if (!b.skillModifiers || typeof b.skillModifiers !== "object") {
        b.skillModifiers = {};
      }
      Object.keys(b.skillModifiers).forEach((sid) => {
        if (!b.skillModifiers[sid] || !MOD_BY_ID.has(b.skillModifiers[sid])) {
          delete b.skillModifiers[sid];
        }
      });
      if (b.weaponMiniBuildId) {
        const wmb = getWeaponMiniBuild(b.weaponMiniBuildId);
        const gsId = wmb && wmb.grantedSkill && wmb.grantedSkill.skillId;
        if (gsId && b.weaponSkillModId && MOD_BY_ID.has(b.weaponSkillModId)) {
          b.skillModifiers[gsId] = b.weaponSkillModId;
        }
      }
      if (!b.ranks || typeof b.ranks !== "object") b.ranks = {};
      Object.keys(b.ranks).forEach((sid) => {
        if (!allowed.has(sid) || b.ranks[sid] <= 0) {
          delete b.ranks[sid];
        }
      });
      const sumPts = Object.values(b.ranks).reduce((acc, v) => acc + (Number(v) || 0), 0);
      if (b.isPresetSeeded && sumPts === 0) {
        const matchedPreset = presets.find((p) => p.id === b.id || p.name === b.name);
        if (matchedPreset) {
          b.ranks = seedPresetRanksForHero(hero, matchedPreset, hs.treeGrid, hs.prereqByTree);
        }
      }
      if (!Array.isArray(b.rotation)) b.rotation = [];
      const wmb = b.weaponMiniBuildId ? getWeaponMiniBuild(b.weaponMiniBuildId) : null;
      const grantedSid = wmb && wmb.grantedSkill && wmb.grantedSkill.skillId;
      b.rotation = b.rotation.filter(
        (st) => st && st.skillId && (allowed.has(st.skillId) || (grantedSid && st.skillId === grantedSid))
      );
    });

    let active = hs.builds.find((b) => b.id === hs.activeBuildId) || hs.builds.find((b) => b.id === hs.presetId);
    if (!active) active = hs.builds[0];
    hs.activeBuildId = active.id;
    hs.presetId = active.id;
    hs.ranks = active.ranks;
    return active;
  }

  function ensureHeroStateShape(hero, hs) {
    const fallback = makeDefaultHeroState(hero);
    if (!hs || typeof hs !== "object") return fallback;
    const merged = {
      ...fallback,
      ...hs,
      treeGrid: Array.isArray(hs.treeGrid) && hs.treeGrid.length === 3 ? hs.treeGrid : fallback.treeGrid,
      prereqByTree:
        Array.isArray(hs.prereqByTree) && hs.prereqByTree.length === 3 ? hs.prereqByTree : fallback.prereqByTree,
      builds: Array.isArray(hs.builds) && hs.builds.length > 0 ? hs.builds : null,
      ranks: hs.ranks && typeof hs.ranks === "object" ? hs.ranks : fallback.ranks,
    };
    reconcileHeroBuilds(hero, merged);
    return merged;
  }

  function makeFreshDefaultState() {
    const base = {
      version: 6,
      updatedAt: 0,
      activeMode: "trees",
      activeHeroId: DATA.heroes[0].id,
      guideHidden: false,
      paletteCollapsed: false,
      autoLoop: true,
      comboLoop: false,
      slowMo: false,
      customHeroes: [],
      customSkills: {},
      heroStates: {},
    };
    DATA.heroes.forEach((h) => {
      base.heroStates[h.id] = makeDefaultHeroState(h);
    });
    return base;
  }

  function hydrateStateObject(raw) {
    const base = makeFreshDefaultState();
    if (!raw || typeof raw !== "object") return base;
    const customHeroes = Array.isArray(raw.customHeroes) ? raw.customHeroes : [];
    const customSkills = normalizeCustomSkillsMap(raw.customSkills);
    ALL_SKILLS.clear();
    BASE_SKILLS.forEach((v, k) => ALL_SKILLS.set(k, { ...v }));
    Object.keys(customSkills).forEach((id) => {
      const bSk = BASE_SKILLS.get(id) || {};
      ALL_SKILLS.set(id, { ...bSk, ...customSkills[id], id });
    });
    const merged = {
      ...base,
      ...raw,
      activeMode: normalizeMode(raw.activeMode),
      customHeroes,
      customSkills,
      heroStates: { ...base.heroStates },
    };
    if (raw.heroStates && typeof raw.heroStates === "object") {
      Object.keys(raw.heroStates).forEach((hid) => {
        const heroObj =
          DATA.heroes.find((h) => h.id === hid) ||
          customHeroes.find((h) => h.id === hid) ||
          DATA.heroes[0];
        merged.heroStates[hid] = ensureHeroStateShape(heroObj, raw.heroStates[hid]);
      });
    }
    customHeroes.forEach((ch) => {
      if (!merged.heroStates[ch.id]) {
        merged.heroStates[ch.id] = makeDefaultHeroState(ch);
      }
    });
    return merged;
  }

  function loadInitialState() {
    try {
      const rawV5 = localStorage.getItem(STORAGE_KEY);
      if (rawV5) return hydrateStateObject(JSON.parse(rawV5));
      const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (rawLegacy) return hydrateStateObject(JSON.parse(rawLegacy));
    } catch (_e) {}
    return makeFreshDefaultState();
  }

  let state = loadInitialState();

  function rebuildSkillMap() {
    ALL_SKILLS.clear();
    BASE_SKILLS.forEach((v, k) => ALL_SKILLS.set(k, { ...v }));
    const csMap = normalizeCustomSkillsMap(state.customSkills);
    state.customSkills = csMap;
    Object.keys(csMap).forEach((id) => {
      const base = BASE_SKILLS.get(id) || {};
      ALL_SKILLS.set(id, { ...base, ...csMap[id], id });
    });
  }
  rebuildSkillMap();

  function getUndoableSnapshot() {
    return JSON.stringify({
      activeHeroId: state.activeHeroId,
      customHeroes: state.customHeroes,
      customSkills: state.customSkills,
      heroStates: state.heroStates,
    });
  }

  function syncUndoButtons() {
    const u = document.getElementById("btnUndo");
    const mu = document.getElementById("btnMobileUndo");
    const r = document.getElementById("btnRedo");
    if (u) u.disabled = undoStack.length === 0;
    if (mu) mu.disabled = undoStack.length === 0;
    if (r) r.disabled = redoStack.length === 0;
  }

  function pushUndoSnapshot() {
    const snap = getUndoableSnapshot();
    if (undoStack.length && undoStack[undoStack.length - 1] === snap) return;
    undoStack.push(snap);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    redoStack = [];
    syncUndoButtons();
  }

  function applyUndoableSnapshot(snapStr) {
    try {
      const parsed = JSON.parse(snapStr);
      state.activeHeroId = parsed.activeHeroId || DATA.heroes[0].id;
      state.customHeroes = parsed.customHeroes || [];
      state.customSkills = normalizeCustomSkillsMap(parsed.customSkills);
      state.heroStates = parsed.heroStates || {};
      DATA.heroes.forEach((h) => {
        state.heroStates[h.id] = ensureHeroStateShape(h, state.heroStates[h.id]);
      });
      rebuildSkillMap();
      targetSlot = null;
      saveState();
      renderAll();
      triggerSkillPreview(currentHeroState().selectedSkillId, true);
    } catch (_e) {}
  }

  function performUndo() {
    if (!undoStack.length) return;
    redoStack.push(getUndoableSnapshot());
    const prev = undoStack.pop();
    syncUndoButtons();
    applyUndoableSnapshot(prev);
    showToast("↩ Undid last change");
  }

  function performRedo() {
    if (!redoStack.length) return;
    undoStack.push(getUndoableSnapshot());
    const next = redoStack.pop();
    syncUndoButtons();
    applyUndoableSnapshot(next);
    showToast("↪ Redid change");
  }

  function updateSyncPill(statusText, isOffline) {
    const pill = document.getElementById("syncStatusPill");
    if (!pill) return;
    pill.textContent = statusText;
    pill.classList.toggle("offline", Boolean(isOffline));
  }

  function scheduleServerSync() {
    if (!canUseServerSync()) {
      updateSyncPill(isStaticGitHubPages() ? "💾 Saved in App" : "💾 Saved Local", !isStaticGitHubPages());
      return;
    }
    updateSyncPill("☁️ Syncing...", false);
    if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
    syncDebounceTimer = setTimeout(() => {
      fetch("/api/custom-saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Sync error");
          return res.json();
        })
        .then(() => updateSyncPill("☁️ Synced", false))
        .catch(() => updateSyncPill("💾 Saved Offline", true));
    }, 350);
  }

  function saveState(opts) {
    const options = opts || {};
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_e) {}
    if (!options.skipServer) {
      scheduleServerSync();
    }
  }

  async function hydrateFromServerIfNewer(skipBecauseSharedUrl) {
    if (!canUseServerSync()) {
      updateSyncPill(isStaticGitHubPages() ? "💾 Saved in App" : "💾 Local Mode", !isStaticGitHubPages());
      return;
    }
    try {
      const res = await fetch("/api/custom-saves", { cache: "no-store" });
      if (!res.ok) throw new Error("Offline");
      const data = await res.json();
      if (data && data.ok && data.hasSave && data.state && !skipBecauseSharedUrl) {
        const srvTime = Number(data.state.updatedAt) || 0;
        const locTime = Number(state.updatedAt) || 0;
        if (srvTime > locTime) {
          state = hydrateStateObject(data.state);
          rebuildSkillMap();
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          } catch (_e) {}
          renderAll();
          triggerSkillPreview(currentHeroState().selectedSkillId, true);
        } else if (locTime > srvTime) {
          scheduleServerSync();
          return;
        }
      }
      updateSyncPill("☁️ Synced", false);
    } catch (_e) {
      updateSyncPill("💾 Saved Offline", true);
    }
  }

  // ==========================================================================
  // 2. HERO & SKILL HELPERS
  // ==========================================================================
  function allHeroes() {
    return [...DATA.heroes, ...(state.customHeroes || [])];
  }

  function currentHero() {
    return allHeroes().find((h) => h.id === state.activeHeroId) || DATA.heroes[0];
  }

  function currentHeroState() {
    const h = currentHero();
    if (!state.heroStates[h.id]) {
      state.heroStates[h.id] = makeDefaultHeroState(h);
    }
    reconcileHeroBuilds(h, state.heroStates[h.id]);
    return state.heroStates[h.id];
  }

  function currentActiveBuild() {
    const h = currentHero();
    const hs = currentHeroState();
    return reconcileHeroBuilds(h, hs);
  }

  function getHeroDisplayMeta(hero) {
    const hs = state.heroStates[hero.id];
    const ov = (hs && hs.heroMetaOverride) || {};
    const treeOv = (hs && hs.treeMetaOverrides) || [];
    const trees = [0, 1, 2].map((i) => {
      const baseT = (hero.classTrees && hero.classTrees[i]) || {
        treeNumber: i + 1,
        id: `${hero.id}_t${i + 1}`,
        name: `Combat Tree ${i + 1}`,
        weaponFocus: "Mixed Arms",
        theme: "Custom skill tree",
        skills: [],
      };
      const tOverride = treeOv[i] || {};
      return {
        ...baseT,
        name: tOverride.name || baseT.name,
        weaponFocus: tOverride.weaponFocus || baseT.weaponFocus,
        theme: tOverride.theme || baseT.theme,
      };
    });
    return {
      name: ov.name || hero.name,
      title: ov.title || hero.title,
      portrait: ov.portrait || hero.portrait || "assets/portraits/amazonicon.png",
      combatIdentity: formatCombatIdentity(ov.combatIdentity || hero.combatIdentity),
      trees,
    };
  }

  function isBaseHeroModified(heroId) {
    const baseHero = DATA.heroes.find((h) => h.id === heroId);
    if (!baseHero) return false;
    const hs = state.heroStates[heroId];
    if (!hs) return false;
    if (hs.heroMetaOverride || hs.treeMetaOverrides) return true;
    const def = makeDefaultHeroState(baseHero);
    return JSON.stringify(hs.treeGrid) !== JSON.stringify(def.treeGrid);
  }

  function formatD2Badge(hero) {
    if (hero.isCustom) return hero.clonedFrom ? "Clone" : "Custom";
    const slot = hero.d2Slot;
    if (typeof slot === "string") {
      return slot.split("(")[0].replace("Slot", "").trim() || "Base";
    }
    if (slot && typeof slot === "object") {
      if (slot.d2ClassName) return `D2 ${slot.d2ClassName.split("/")[0].trim()}`;
      if (slot.d2ClassCode) return `D2 ${String(slot.d2ClassCode).toUpperCase()}`;
    }
    return "Base Class";
  }

  function getSkill(id) {
    return ALL_SKILLS.get(id) || WEAPON_GRANTED_SKILLS.get(id) || DATA.skillLibrary[0];
  }

  function totalBuildPoints(buildOrHs) {
    const r = (buildOrHs && buildOrHs.ranks) || {};
    return Object.values(r).reduce((a, b) => a + (Number(b) || 0), 0);
  }

  function totalPoints(hs) {
    return totalBuildPoints(hs);
  }

  function shortOriginTag(sk) {
    if (String(sk.id || "").startsWith("custom_") && !(sk.primaryOrigin || sk.similarTo)) {
      return "Custom";
    }
    const sim = `${sk.primaryOrigin || ""} ${sk.origGameSkillName || ""} ${sk.similarTo || ""}`.toLowerCase();
    if (sim.includes("diablo ii") || sim.includes("d2r")) return "D2R";
    if (sim.includes("dota 2")) return "DotA 2";
    if (sim.includes("path of exile")) return "PoE 2";
    if (sim.includes("guild wars")) return "GW2";
    if (sim.includes("elden ring")) return "Elden Ring";
    if (sim.includes("last epoch")) return "Last Epoch";
    if (sim.includes("v rising")) return "V Rising";
    if (sim.includes("bannerlord")) return "Bannerlord";
    if (sim.includes("mordhau") || sim.includes("chivalry")) return "Mordhau";
    if (sim.includes("sekiro")) return "Sekiro";
    if (sim.includes("custom")) return "Custom";
    return "ARPG";
  }

  function skillMatchesTag(sk, tag) {
    if (!tag || tag === "All") return true;
    const hay = [
      sk.name,
      sk.castType,
      sk.damageType,
      (sk.effects || []).join(" "),
      sk.comboRole,
      sk.bcExactInteraction,
      sk.mechanic,
      sk.choreography && sk.choreography.pattern,
    ]
      .filter(Boolean)
      .join(" ");
    switch (tag) {
      case "AoE":
        return /\baoe\b|cone|nova|volley|rain|zone|cleave|whirl|explosion|cloud|ring|fan|crater/i.test(hay);
      case "Single":
        return /single|duel|execute|execution|snipe|seeker|homing|assassinate|impale|thrust|jab/i.test(hay);
      case "Stun/Freeze":
        return /stun|freeze|frozen|petrif|knockdown|wall-pin|pin|paralyz|immobiliz|root/i.test(hay);
      case "Slow":
        return /slow|chill|crippl|caltrop|snare|tar|hinder|frost/i.test(hay);
      case "Pierce":
        return /pierce|piercing|line|rail|skewer|bolt|javelin|lance/i.test(hay);
      case "DoT":
        return /\bdot\b|bleed|poison|plague|burn|ignite|firewall|blight|venom|siphon|corrupt/i.test(hay);
      case "Pull/Hook":
        return /pull|hook|harpoon|grapple|vortex|vacuum|drag|tether/i.test(hay);
      case "Dash":
        return /dash|leap|blink|teleport|vault|charge|pounce|stride|evade/i.test(hay);
      case "Summon":
        return /summon|turret|sentry|hydra|skeleton|wolf|wolves|pack|clone|decoy|banner|warband|troop|falcon/i.test(hay);
      default:
        return true;
    }
  }

  function skillMatchesFilters(sk, f) {
    if (f.hero && f.hero !== "ALL") {
      if (f.hero === "Custom") {
        if (!state.customSkills[sk.id]) return false;
      } else if ((sk.originHero || "") !== f.hero) {
        return false;
      }
    }
    if (f.game && f.game !== "ALL") {
      if (f.game === "Custom") {
        if (!state.customSkills[sk.id]) return false;
      } else {
        const hayG = `${sk.primaryOrigin || ""} ${sk.origGameSkillName || ""} ${sk.similarTo || ""}`.toLowerCase();
        if (!hayG.includes(f.game.toLowerCase())) return false;
      }
    }
    if (f.tag && f.tag !== "All" && !skillMatchesTag(sk, f.tag)) {
      return false;
    }
    const q = (f.search || "").trim().toLowerCase();
    if (q) {
      const hay = [
        sk.name,
        sk.originHero,
        sk.originTree,
        sk.castType,
        sk.origGameSkillName,
        sk.similarTo,
        sk.bcExactInteraction,
        sk.mechanic,
        (sk.effects || []).join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  // ==========================================================================
  // 3. TOP ROSTER, WORKFLOW SWITCH, HERO BUILDS & PLAYSTYLE SEQUENCER
  // ==========================================================================
  function computeBuildTreePoints(hero, hs, ranksMap) {
    const r = ranksMap || hs.ranks || {};
    const meta = getHeroDisplayMeta(hero);
    const out = [0, 1, 2].map((ti) => {
      const cells = (hs.treeGrid && hs.treeGrid[ti]) || {};
      const pts = Object.values(cells).reduce((sum, sid) => sum + (Number(r[sid]) || 0), 0);
      return {
        tabId: `tree${ti + 1}`,
        shortLabel: `T${ti + 1}`,
        name: (meta.trees[ti] && meta.trees[ti].name) || `Tree ${ti + 1}`,
        weaponFocus: (meta.trees[ti] && meta.trees[ti].weaponFocus) || "",
        pts,
      };
    });
    [0, 1].forEach((ui) => {
      const ut = DATA.universalTrees[ui];
      const pts = ((ut && ut.skills) || []).reduce((sum, sk) => sum + (Number(r[sk.id]) || 0), 0);
      out.push({
        tabId: `tree${ui + 4}`,
        shortLabel: ui === 0 ? "Mob" : "Cmd",
        name: ui === 0 ? "Mobility" : "Warband",
        weaponFocus: ui === 0 ? "Stamina & Evade" : "Mercenary Command",
        pts,
      });
    });
    return out;
  }

  function getActiveSkillModifierForBuild(skillId, buildOpt) {
    const b = buildOpt || currentActiveBuild();
    if (!b || !skillId) return null;
    const modId = b.skillModifiers && b.skillModifiers[skillId];
    return modId ? getModifier(modId) : null;
  }

  function setSkillModifierOnActiveBuild(skillId, modIdOrEmpty) {
    const hs = currentHeroState();
    const b = currentActiveBuild();
    if (!b || !skillId) return;
    pushUndoSnapshot();
    if (!b.skillModifiers || typeof b.skillModifiers !== "object") b.skillModifiers = {};
    const cur = b.skillModifiers[skillId] || "";
    const next = cur === modIdOrEmpty ? "" : modIdOrEmpty || "";
    if (next && MOD_BY_ID.has(next)) {
      b.skillModifiers[skillId] = next;
      const wmb = b.weaponMiniBuildId ? getWeaponMiniBuild(b.weaponMiniBuildId) : null;
      if (wmb && wmb.grantedSkill && wmb.grantedSkill.skillId === skillId) {
        b.weaponSkillModId = next;
      }
      // Auto-invest 1 rank if this is a slotted skill with 0 ranks in Builds mode
      if (
        normalizeMode(state.activeMode) === "builds" &&
        !WEAPON_GRANTED_SKILLS.has(skillId) &&
        getHeroAllowedSkillSet(hs).has(skillId) &&
        (b.ranks[skillId] || 0) === 0 &&
        totalBuildPoints(b) < MAX_SKILL_POINTS
      ) {
        b.ranks[skillId] = 1;
      }
    } else {
      delete b.skillModifiers[skillId];
      const wmb = b.weaponMiniBuildId ? getWeaponMiniBuild(b.weaponMiniBuildId) : null;
      if (wmb && wmb.grantedSkill && wmb.grantedSkill.skillId === skillId) {
        b.weaponSkillModId = "";
      }
    }
    hs.selectedSkillId = skillId;
    saveState();
    renderAll();
    triggerSkillPreview(skillId, true);
    const modObj = next ? getModifier(next) : null;
    const sk = getSkill(skillId);
    showToast(
      modObj
        ? `⚡ Socketed "${modObj.name}" onto ${sk.name}!`
        : `Cleared modifier on ${sk.name} (Base Behavior)`
    );
  }

  function setWeaponArchetypeOnActiveBuild(archId) {
    const b = currentActiveBuild();
    const arch = getWeaponArchetype(archId);
    if (!b || !arch) return;
    pushUndoSnapshot();
    b.weaponArchetypeId = arch.id;
    b.weapons = arch.name;
    saveState();
    renderAll();
    triggerSkillPreview(currentHeroState().selectedSkillId, true);
    showToast(`⚔️ Equipped Weapon Archetype: ${arch.name}`);
  }

  function setWeaponMiniBuildOnActiveBuild(wmbId) {
    const hs = currentHeroState();
    const b = currentActiveBuild();
    if (!b) return;
    pushUndoSnapshot();
    const prevWmb = b.weaponMiniBuildId ? getWeaponMiniBuild(b.weaponMiniBuildId) : null;
    const prevSid = prevWmb && prevWmb.grantedSkill && prevWmb.grantedSkill.skillId;
    if (prevSid && Array.isArray(b.rotation)) {
      b.rotation = b.rotation.filter((r) => r && r.skillId !== prevSid);
    }

    if (!wmbId || !WEAPON_MB_BY_ID.has(wmbId)) {
      b.weaponMiniBuildId = "";
      b.weaponSkillModId = "";
      if (prevSid && hs.selectedSkillId === prevSid) {
        const rot = deriveBuildRotationIds(b, hs);
        hs.selectedSkillId = rot[0] || DATA.skillLibrary[0].id;
      }
      saveState();
      renderAll();
      showToast("Unequipped Unique / Runeword Weapon Mini-Build");
      return;
    }

    const wmb = getWeaponMiniBuild(wmbId);
    b.weaponMiniBuildId = wmb.id;
    if (wmb.archetypeId && WEAPON_ARCH_BY_ID.has(wmb.archetypeId)) {
      b.weaponArchetypeId = wmb.archetypeId;
    }
    const gs = wmb.grantedSkill;
    if (gs && gs.skillId) {
      const defaultChoice = (gs.modifierChoices && gs.modifierChoices[0] && gs.modifierChoices[0].modifierId) || "";
      if (!b.skillModifiers) b.skillModifiers = {};
      if (!b.skillModifiers[gs.skillId] && defaultChoice && MOD_BY_ID.has(defaultChoice)) {
        b.skillModifiers[gs.skillId] = defaultChoice;
        b.weaponSkillModId = defaultChoice;
      }
      if (!Array.isArray(b.rotation)) b.rotation = [];
      if (!b.rotation.some((r) => r && r.skillId === gs.skillId)) {
        if (b.rotation.length >= 5) b.rotation.pop();
        b.rotation.push({
          skillId: gs.skillId,
          role: `${b.rotation.length + 1}. Weapon Skill`,
          note: wmb.name,
        });
      }
      hs.selectedSkillId = gs.skillId;
    }
    saveState();
    renderAll();
    if (gs && gs.skillId) {
      triggerSkillPreview(gs.skillId, true);
    }
    showToast(`🗡️ Equipped "${wmb.name}" — Granted Skill: ${gs ? gs.name : "Ready"}!`);
  }

  function deriveBuildRotationIds(build, hs) {
    const allowed = getHeroAllowedSkillSet(hs);
    const wmb = build && build.weaponMiniBuildId ? getWeaponMiniBuild(build.weaponMiniBuildId) : null;
    const grantedSid = wmb && wmb.grantedSkill && wmb.grantedSkill.skillId;
    const explicit = ((build && build.rotation) || [])
      .map((st) => st && st.skillId)
      .filter((sid) => sid && (allowed.has(sid) || (grantedSid && sid === grantedSid)));
    if (explicit.length > 0) return explicit;

    // Fallback: top invested skills across the hero's slotted trees
    const ranked = Object.entries((build && build.ranks) || {})
      .filter(([sid, rk]) => rk > 0 && allowed.has(sid))
      .sort((a, b) => {
        const skA = getSkill(a[0]);
        const skB = getSkill(b[0]);
        const activeBoostA = String(skA.kind || skA.castType || "").toLowerCase().includes("passive") ? 0 : 100;
        const activeBoostB = String(skB.kind || skB.castType || "").toLowerCase().includes("passive") ? 0 : 100;
        return b[1] + activeBoostB - (a[1] + activeBoostA);
      })
      .map(([sid]) => sid)
      .slice(0, 4);
    if (grantedSid && !ranked.includes(grantedSid)) {
      ranked.push(grantedSid);
    }
    if (ranked.length > 0) return ranked;

    const fallback = [];
    (hs.treeGrid || []).forEach((cells) => {
      Object.values(cells || {}).forEach((sid) => {
        if (sid && fallback.length < 4 && !fallback.includes(sid)) fallback.push(sid);
      });
    });
    return fallback;
  }

  function syncActiveBuildRotationFromPoints(silent) {
    const hs = currentHeroState();
    const build = currentActiveBuild();
    if (!silent) pushUndoSnapshot();
    const topIds = Object.entries(build.ranks || {})
      .filter(([sid, rk]) => rk > 0 && getHeroAllowedSkillSet(hs).has(sid))
      .sort((a, b) => {
        const skA = getSkill(a[0]);
        const skB = getSkill(b[0]);
        const pA = String(skA.kind || "").toLowerCase() === "passive" ? -50 : (skA.tier || 1) * 3;
        const pB = String(skB.kind || "").toLowerCase() === "passive" ? -50 : (skB.tier || 1) * 3;
        return b[1] + pB - (a[1] + pA);
      })
      .slice(0, 4)
      .map(([sid]) => sid);

    const wmb = build && build.weaponMiniBuildId ? getWeaponMiniBuild(build.weaponMiniBuildId) : null;
    const grantedSid = wmb && wmb.grantedSkill && wmb.grantedSkill.skillId;
    if (grantedSid && !topIds.includes(grantedSid)) {
      if (topIds.length >= 4) topIds.pop();
      topIds.push(grantedSid);
    }

    const roleLabels = ["1. Opener", "2. Setup / CC", "3. Core DPS", "4. Finisher"];
    build.rotation = topIds.map((sid, idx) => ({
      skillId: sid,
      role: sid === grantedSid ? `${idx + 1}. Weapon Skill` : roleLabels[idx] || `${idx + 1}. Step ${idx + 1}`,
      note: getSkill(sid).comboRole || "",
    }));
    if (!silent) {
      saveState();
      renderAll();
      if (topIds.length) {
        playActiveBuildCombo({ resetPack: true });
        showToast(`🪄 Synced ${topIds.length}-step gameplay rotation from invested points!`);
      } else {
        showToast("Invest points into skills first, then click Sync From Points");
      }
    }
  }

  function toggleSkillInActiveBuildRotation(skillId) {
    const hs = currentHeroState();
    const build = currentActiveBuild();
    const wmb = build && build.weaponMiniBuildId ? getWeaponMiniBuild(build.weaponMiniBuildId) : null;
    const grantedSid = wmb && wmb.grantedSkill && wmb.grantedSkill.skillId;
    if (!getHeroAllowedSkillSet(hs).has(skillId) && skillId !== grantedSid) return;
    pushUndoSnapshot();
    if (!Array.isArray(build.rotation)) build.rotation = [];
    const existingIdx = build.rotation.findIndex((st) => st && st.skillId === skillId);
    const sk = getSkill(skillId);
    if (existingIdx >= 0) {
      build.rotation.splice(existingIdx, 1);
      build.rotation.forEach((st, i) => {
        if (/^\d+\.\s*Step/i.test(st.role || "")) st.role = `${i + 1}. Step ${i + 1}`;
      });
      saveState();
      renderAll();
      showToast(`Removed "${sk.name}" from build combo rotation`);
    } else {
      if (build.rotation.length >= 5) {
        build.rotation.shift();
      }
      const stepNum = build.rotation.length + 1;
      build.rotation.push({
        skillId,
        role: skillId === grantedSid
          ? `${stepNum}. Weapon Skill`
          : `${stepNum}. ${sk.comboRole ? sk.comboRole.split(/[\u2014\-:(]/)[0].trim().slice(0, 16) : `Step ${stepNum}`}`,
        note: "",
      });
      if (skillId !== grantedSid && (build.ranks[skillId] || 0) === 0 && totalBuildPoints(build) < MAX_SKILL_POINTS) {
        build.ranks[skillId] = 1;
      }
      saveState();
      renderAll();
      showToast(`⭐ Added "${sk.name}" to Step ${build.rotation.length} of build rotation!`);
    }
  }

  function selectHeroBuild(buildId, opts) {
    const hero = currentHero();
    const hs = currentHeroState();
    const found = (hs.builds || []).find((b) => b.id === buildId);
    if (!found) return;
    hs.activeBuildId = found.id;
    hs.presetId = found.id;
    hs.ranks = found.ranks;

    // Jump to the primary invested class tree so the user immediately sees allocated points
    const splits = computeBuildTreePoints(hero, hs, found.ranks).slice(0, 3);
    const bestTree = splits.reduce((best, cur) => (cur.pts > best.pts ? cur : best), splits[0]);
    if (bestTree && bestTree.pts > 0) {
      hs.activeTab = bestTree.tabId;
    }

    const rotIds = deriveBuildRotationIds(found, hs);
    if (rotIds.length > 0) {
      hs.selectedSkillId = rotIds[0];
    }

    if (opts && opts.switchToBuildsMode) {
      state.activeMode = "builds";
    }

    saveState();
    renderAll();
    if (opts && opts.playCombo) {
      playActiveBuildCombo({ resetPack: true });
    } else {
      triggerSkillPreview(hs.selectedSkillId, true);
    }
  }

  function createNewBuildForActiveHero(kind) {
    const hero = currentHero();
    const hs = currentHeroState();
    const meta = getHeroDisplayMeta(hero);
    const curBuild = currentActiveBuild();
    pushUndoSnapshot();

    const id = `${hero.id}_build_${Date.now()}`;
    let newBuild;

    if (kind === "duplicate") {
      newBuild = {
        ...deepClone(curBuild),
        id,
        name: `${curBuild.name} (Copy)`,
        isPresetSeeded: false,
      };
    } else if (kind === "autofill") {
      const ti = getActiveClassTreeIndex(hs);
      const focusTree = meta.trees[ti] || meta.trees[0];
      const cells = hs.treeGrid[ti] || {};
      const ranks = {};
      let spent = 0;
      const ordered = Object.entries(cells).sort((a, b) => {
        const tA = parseInt(a[0].split("_")[0], 10) || 1;
        const tB = parseInt(b[0].split("_")[0], 10) || 1;
        return tB - tA;
      });
      ordered.forEach(([cellKey, sid], idx) => {
        if (!sid) return;
        const tier = parseInt(cellKey.split("_")[0], 10) || 1;
        const sk = getSkill(sid);
        const want = Math.min(sk.maxRank || 20, idx < 2 ? 20 : tier >= 3 ? 14 : 6);
        const add = Math.min(want, Math.max(0, 82 - spent));
        if (add > 0) {
          ranks[sid] = add;
          spent += add;
        }
      });
      ranks["mob_second_wind"] = 5;
      ranks["mob_evade_mastery"] = 4;
      ranks["cmd_mercenary_levy"] = 5;

      const rotSkills = Object.keys(ranks)
        .filter((sid) => !sid.startsWith("mob_") && !sid.startsWith("cmd_"))
        .slice(0, 4);
      const seedMods = {};
      rotSkills.slice(0, 2).forEach((sid, idx) => {
        const compat = getCompatibleModifiersForSkill(getSkill(sid));
        if (compat.curated[idx % Math.max(1, compat.curated.length)]) {
          seedMods[sid] = compat.curated[idx % compat.curated.length].id;
        }
      });
      const roleLabels = ["1. Opener", "2. Setup", "3. Primary Burst", "4. Finisher"];
      newBuild = {
        id,
        name: `${focusTree.name.split("&")[0].trim()} Specialist`,
        archetype: `${focusTree.weaponFocus || "Focused"} Build`,
        weapons: focusTree.weaponFocus || "",
        weaponArchetypeId: inferWeaponArchetypeForText(focusTree.weaponFocus || "", hero.id),
        weaponMiniBuildId: "",
        weaponSkillModId: "",
        skillModifiers: seedMods,
        loopNotes: `Focused ${focusTree.name} build paired with +50% Mobility stamina regen and Mercenary Levy support.`,
        synergyNotes: "",
        ranks,
        rotation: rotSkills.map((sid, i) => ({
          skillId: sid,
          role: roleLabels[i] || `${i + 1}. Step ${i + 1}`,
          note: "",
        })),
        isPresetSeeded: false,
      };
    } else {
      const count = (hs.builds || []).length + 1;
      const wText = (meta.trees[0] && meta.trees[0].weaponFocus) || "";
      newBuild = {
        id,
        name: `${meta.name} Build #${count}`,
        archetype: "Custom Build",
        weapons: wText,
        weaponArchetypeId: inferWeaponArchetypeForText(wText, hero.id),
        weaponMiniBuildId: "",
        weaponSkillModId: "",
        skillModifiers: {},
        loopNotes: "Click skills in the tree (+1 / Shift+Click +5 / Right-Click -1) to invest up to 110 points, socket skill behavior modifiers, then play the combo!",
        synergyNotes: "",
        ranks: {},
        rotation: [],
        isPresetSeeded: false,
      };
    }

    hs.builds.unshift(newBuild);
    hs.activeBuildId = newBuild.id;
    hs.presetId = newBuild.id;
    hs.ranks = newBuild.ranks;
    state.activeMode = "builds";
    targetSlot = null;

    saveState();
    renderAll();

    if (kind === "autofill" || kind === "duplicate") {
      playActiveBuildCombo({ resetPack: true });
      showToast(kind === "duplicate" ? `📋 Duplicated "${curBuild.name}"` : `🪄 Auto-built "${newBuild.name}" — playing combo!`);
    } else {
      showToast(`✨ Created "${newBuild.name}" — click tree nodes to allocate 110 points!`);
      const nameInp = document.getElementById("buildNameInput");
      if (nameInp) {
        nameInp.focus();
        nameInp.select();
      }
    }
  }

  function deleteActiveBuildFromHero(buildId) {
    const hero = currentHero();
    const hs = currentHeroState();
    const targetId = buildId || hs.activeBuildId;
    const idx = (hs.builds || []).findIndex((b) => b.id === targetId);
    if (idx < 0) return;
    pushUndoSnapshot();
    const removed = hs.builds[idx];
    hs.builds.splice(idx, 1);
    if (hs.builds.length === 0) {
      const meta = getHeroDisplayMeta(hero);
      hs.builds.push({
        id: `${hero.id}_build_${Date.now()}`,
        name: `${meta.name} Custom Build`,
        archetype: "Custom Build",
        weapons: "",
        loopNotes: "",
        synergyNotes: "",
        ranks: {},
        rotation: [],
        isPresetSeeded: false,
      });
    }
    const next = hs.builds[Math.min(idx, hs.builds.length - 1)];
    hs.activeBuildId = next.id;
    hs.presetId = next.id;
    hs.ranks = next.ranks;
    saveState();
    renderAll();
    showToast(`🗑️ Deleted build "${removed.name}" (Ctrl+Z to undo)`);
  }

  function cloneHeroById(sourceHeroId, overrides) {
    const src = allHeroes().find((h) => h.id === sourceHeroId) || currentHero();
    const srcMeta = getHeroDisplayMeta(src);
    const srcState = ensureHeroStateShape(src, state.heroStates[src.id]);

    pushUndoSnapshot();

    const id = `custom_hero_${Date.now()}`;
    const existingNames = new Set(allHeroes().map((h) => getHeroDisplayMeta(h).name));
    let defaultName = `${srcMeta.name} (Copy)`;
    let n = 2;
    while (existingNames.has(defaultName)) {
      defaultName = `${srcMeta.name} (Copy ${n++})`;
    }

    const customTrees = srcMeta.trees.map((t, idx) => {
      const ovT = overrides && overrides.trees && overrides.trees[idx];
      return {
        treeNumber: idx + 1,
        id: `${id}_t${idx + 1}`,
        name: (ovT && ovT.name) || t.name,
        weaponFocus: (ovT && ovT.weaponFocus) || t.weaponFocus,
        theme: (ovT && ovT.theme) || t.theme || "Custom forged tree",
        skills: [],
      };
    });

    const newHero = {
      id,
      isCustom: true,
      clonedFrom: src.id,
      name: (overrides && overrides.name) || defaultName,
      title: (overrides && overrides.title) || srcMeta.title,
      portrait: (overrides && overrides.portrait) || srcMeta.portrait,
      d2Slot: `Cloned from ${srcMeta.name}`,
      combatIdentity: (overrides && overrides.combatIdentity) || srcMeta.combatIdentity,
      classTrees: customTrees,
      presets: [],
    };

    const clonedBuilds = deepClone(srcState.builds || []).map((b, bi) => ({
      ...b,
      id: `${id}_build_${bi}`,
      isPresetSeeded: false,
    }));
    const firstBuild = clonedBuilds[0] || {
      id: `${id}_build_0`,
      name: `${newHero.name} Build #1`,
      archetype: "Custom Playstyle",
      weapons: customTrees[0].weaponFocus,
      loopNotes: "",
      synergyNotes: "",
      ranks: deepClone(srcState.ranks || {}),
      rotation: [],
      isPresetSeeded: false,
    };
    if (!clonedBuilds.length) clonedBuilds.push(firstBuild);

    state.customHeroes.push(newHero);
    state.heroStates[id] = {
      heroId: id,
      presetId: firstBuild.id,
      activeBuildId: firstBuild.id,
      builds: clonedBuilds,
      activeTab: srcState.activeTab || "tree1",
      selectedSkillId: srcState.selectedSkillId || DATA.skillLibrary[0].id,
      treeGrid: deepClone(srcState.treeGrid),
      prereqByTree: deepClone(srcState.prereqByTree || [{}, {}, {}]),
      heroMetaOverride: null,
      treeMetaOverrides: null,
      ranks: firstBuild.ranks,
    };
    state.activeHeroId = id;
    state.activeMode = "trees";
    targetSlot = null;

    saveState();
    renderAll();
    triggerSkillPreview(state.heroStates[id].selectedSkillId, true);
    showToast(`📋 Cloned "${newHero.name}" with ${clonedBuilds.length} build(s) — ready to customize!`);
    return newHero;
  }

  function resetBaseHero(heroId) {
    const baseHero = DATA.heroes.find((h) => h.id === heroId);
    if (!baseHero) return;
    pushUndoSnapshot();
    state.heroStates[heroId] = makeDefaultHeroState(baseHero);
    targetSlot = null;
    saveState();
    renderAll();
    triggerSkillPreview(state.heroStates[heroId].selectedSkillId, true);
    showToast(`↺ Reset ${baseHero.name} trees & signature builds to default`);
  }

  function deleteCustomHero(heroId) {
    const idx = (state.customHeroes || []).findIndex((h) => h.id === heroId);
    if (idx < 0) return;
    const removedName = state.customHeroes[idx].name;
    pushUndoSnapshot();
    state.customHeroes.splice(idx, 1);
    delete state.heroStates[heroId];
    if (state.activeHeroId === heroId) {
      const remaining = allHeroes();
      state.activeHeroId = remaining[Math.max(0, idx)] ? remaining[Math.max(0, idx)].id : DATA.heroes[0].id;
    }
    targetSlot = null;
    saveState();
    renderAll();
    triggerSkillPreview(currentHeroState().selectedSkillId, true);
    showToast(`🗑️ Deleted "${removedName}" (Ctrl+Z to undo)`);
  }

  function renderHeroSelect() {
    const bar = document.getElementById("heroPortraitBar");
    const hero = currentHero();
    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const meta = getHeroDisplayMeta(hero);
    const mode = normalizeMode(state.activeMode);

    const ptsBadge = document.getElementById("pointsSummaryBadge");
    if (ptsBadge) {
      const pts = totalPoints(hs);
      ptsBadge.textContent =
        mode === "builds"
          ? `Active Build: ${activeBuild.name} · ${pts} / ${MAX_SKILL_POINTS} pts`
          : `Skill Points (${activeBuild.name}): ${pts} / ${MAX_SKILL_POINTS}`;
    }

    const buildsCountBadge = document.getElementById("heroBuildsCountBadge");
    if (buildsCountBadge) {
      buildsCountBadge.textContent = String((hs.builds || []).length);
    }

    const codexHeroLbl = document.getElementById("codexActiveHeroLabel");
    if (codexHeroLbl) {
      codexHeroLbl.textContent = meta.name;
    }

    const tilesHtml = allHeroes()
      .map((h) => {
        const hm = getHeroDisplayMeta(h);
        const hState = ensureHeroStateShape(h, state.heroStates[h.id]);
        const active = h.id === hero.id ? "active" : "";
        const weapons = hm.trees
          .map((t) => (t.weaponFocus || "").split("/")[0].trim())
          .filter(Boolean)
          .join(" · ");
        const badgeLabel = formatD2Badge(h);
        const modified = !h.isCustom && isBaseHeroModified(h.id);
        const bCount = (hState.builds || []).length;
        return `
          <button type="button" class="hero-tile ${active}" data-hero-id="${esc(h.id)}">
            <div class="hero-portrait-frame">
              <img src="${esc(hm.portrait)}" alt="${esc(hm.name)}" />
            </div>
            <div class="hero-tile-meta">
              <div class="hero-tile-name">${esc(hm.name)}</div>
              <div class="hero-tile-role">${esc(weapons || hm.title)}</div>
              <div class="hero-tile-badges">
                <span class="hero-badge ${h.isCustom ? "custom" : ""}">${esc(badgeLabel)}</span>
                <span class="hero-badge">${bCount} Build${bCount === 1 ? "" : "s"}</span>
                ${modified ? `<span class="hero-badge modified">Edited</span>` : ""}
              </div>
            </div>
          </button>
        `;
      })
      .join("");

    bar.innerHTML =
      tilesHtml +
      `<button type="button" class="hero-tile new-hero-card" id="btnNewHeroTileCard">✨ + New / Clone Hero</button>`;

    bar.querySelectorAll("[data-hero-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeHeroId = btn.dataset.heroId;
        targetSlot = null;
        state.comboLoop = false;
        const nhs = currentHeroState();
        saveState();
        renderAll();
        if (normalizeMode(state.activeMode) === "builds") {
          playActiveBuildCombo({ resetPack: true });
        } else {
          triggerSkillPreview(nhs.selectedSkillId, true);
        }
      });
    });

    const newCardBtn = document.getElementById("btnNewHeroTileCard");
    if (newCardBtn) {
      newCardBtn.addEventListener("click", () => openHeroWizard("create"));
    }

    // Spotlight Banner: Hero Identity + Prominent 2-Phase Workflow Switch + Quick Build Pills + Hero Actions
    const banner = document.getElementById("heroSpotlightBanner");
    const builds = hs.builds || [];
    const modifiedBase = !hero.isCustom && isBaseHeroModified(hero.id);

    banner.innerHTML = `
      <div class="spotlight-left">
        <div>
          <div class="spotlight-title">${esc(meta.name)} — ${esc(meta.title)}</div>
          <div class="spotlight-desc">${esc(meta.combatIdentity)}</div>
        </div>
      </div>
      <div class="spotlight-controls">
        <div class="hero-workflow-switch" role="group" aria-label="Hero Workflow Mode">
          <button type="button" class="hw-switch-btn trees ${mode === "trees" ? "active" : ""}" data-switch-mode="trees" title="Decide which skills belong in ${esc(meta.name)}'s 3 class trees">
            🛠️ 1. Edit Skill Trees
          </button>
          <button type="button" class="hw-switch-btn builds ${mode === "builds" ? "active" : ""}" data-switch-mode="builds" title="Create &amp; preview specific ${esc(meta.name)} builds using those trees">
            ⚔️ 2. Builds &amp; Playstyle <span class="hw-switch-pill">${builds.length}</span>
          </button>
        </div>
        <span class="v-sep"></span>
        <span class="preset-label">Builds:</span>
        ${builds
          .slice(0, 5)
          .map(
            (b) =>
              `<button type="button" class="preset-chip ${activeBuild.id === b.id && mode === "builds" ? "active" : ""}" data-build-chip-id="${esc(b.id)}" title="${esc(b.archetype || "Open build & preview playstyle")} (${totalBuildPoints(b)}/${MAX_SKILL_POINTS} pts)">${esc(b.name)}</button>`
          )
          .join("")}
        <button type="button" class="btn btn-xs btn-emerald" id="btnSpotlightNewBuild" title="Create a new build on ${esc(meta.name)}'s current skill trees">＋ Build</button>
        <span class="v-sep"></span>
        <button type="button" class="btn btn-xs btn-outline" data-hero-action="edit">✏️ Edit Hero</button>
        ${
          modifiedBase
            ? `<button type="button" class="btn btn-xs btn-outline" data-hero-action="reset">↺ Reset Hero</button>`
            : ""
        }
        ${
          hero.isCustom
            ? `<button type="button" class="btn btn-xs btn-danger-outline" data-hero-action="delete">🗑️ Delete</button> `
            : ""
        }
      </div>
    `;

    banner.querySelectorAll("[data-switch-mode]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextMode = btn.dataset.switchMode;
        setActiveMode(nextMode);
        if (nextMode === "builds") {
          playActiveBuildCombo({ resetPack: true });
          if (isMobileViewport()) setMobileTab("builds");
        } else if (isMobileViewport()) {
          setMobileTab("tree");
        }
      });
    });

    banner.querySelectorAll("[data-build-chip-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectHeroBuild(btn.dataset.buildChipId, { switchToBuildsMode: true, playCombo: true });
        if (isMobileViewport()) setMobileTab("arena");
      });
    });

    const spotNewBuildBtn = document.getElementById("btnSpotlightNewBuild");
    if (spotNewBuildBtn) {
      spotNewBuildBtn.addEventListener("click", () => {
        createNewBuildForActiveHero("blank");
        if (isMobileViewport()) setMobileTab("builds");
      });
    }

    banner.querySelectorAll("[data-hero-action]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.heroAction;
        if (act === "edit") openHeroWizard("edit", hero.id);
        else if (act === "reset") resetBaseHero(hero.id);
        else if (act === "delete") deleteCustomHero(hero.id);
      });
    });
  }

  function renderBuildLoadoutDock() {
    const dock = document.getElementById("buildLoadoutDock");
    if (!dock) return;
    const hero = currentHero();
    const hs = currentHeroState();
    const meta = getHeroDisplayMeta(hero);
    const activeBuild = currentActiveBuild();
    const builds = hs.builds || [];

    const nameEl = document.getElementById("buildDockHeroName");
    const countEl = document.getElementById("buildDockCount");
    if (nameEl) nameEl.textContent = meta.name;
    if (countEl) countEl.textContent = `(${builds.length})`;

    const listEl = document.getElementById("heroBuildsList");
    if (listEl) {
      listEl.innerHTML = builds
        .map((b) => {
          const isAct = b.id === activeBuild.id;
          const pts = totalBuildPoints(b);
          const splits = computeBuildTreePoints(hero, hs, b.ranks).filter((s) => s.pts > 0);
          const rotIds = deriveBuildRotationIds(b, hs).slice(0, 4);
          const wArch = getWeaponArchetype(b.weaponArchetypeId);
          const wMini = b.weaponMiniBuildId ? getWeaponMiniBuild(b.weaponMiniBuildId) : null;
          const modCount = Object.keys(b.skillModifiers || {}).length;
          return `
            <div class="build-loadout-card ${isAct ? "active" : ""}" data-select-build="${esc(b.id)}">
              <div class="build-card-top">
                <div>
                  <div class="build-card-title">${esc(b.name)}</div>
                  <div class="build-card-type">${esc(b.archetype || "Custom Playstyle")}${wArch ? ` · ${esc(wArch.name.split("&")[0].trim())}` : b.weapons ? ` · ${esc(b.weapons.split("(")[0].trim())}` : ""}</div>
                </div>
                <span class="build-pts-chip">${pts} / ${MAX_SKILL_POINTS}</span>
              </div>
              <div class="build-card-splits">
                ${
                  splits.length
                    ? splits
                        .map((s) => `<span class="build-split-pill">${esc(s.name.split("&")[0].trim())}: <b>${s.pts}</b></span>`)
                        .join("")
                    : `<span class="build-split-pill">0 points invested — click nodes to build!</span>`
                }
                ${wMini ? `<span class="build-split-pill gold-pill">🗡️ ${esc(wMini.name)}</span>` : ""}
                ${modCount > 0 ? `<span class="build-split-pill mod-pill">⚡ ${modCount} Mod${modCount > 1 ? "s" : ""}</span>` : ""}
              </div>
              <div class="build-mini-icons">
                <div class="build-mini-icon-row">
                  ${rotIds
                    .map((sid) => {
                      const sk = getSkill(sid);
                      const modObj = getActiveSkillModifierForBuild(sid, b);
                      return `<img src="${esc(sk.icon)}" alt="${esc(sk.name)}" class="${modObj ? "has-mod-ring" : ""}" title="${esc(sk.name)} (${sk.isWeaponGranted ? "Weapon Skill" : `Rank ${b.ranks[sid] || 0}`})${modObj ? ` · ⚡ ${esc(modObj.name)}` : ""}" />`;
                    })
                    .join("")}
                </div>
                <button type="button" class="btn btn-xs ${isAct ? "btn-gold" : "btn-outline"}" data-play-build="${esc(b.id)}" title="Watch this build's combat rotation live">▶ Play</button>
              </div>
            </div>
          `;
        })
        .join("");

      listEl.querySelectorAll("[data-select-build]").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.closest("[data-play-build]")) return;
          selectHeroBuild(card.dataset.selectBuild, { switchToBuildsMode: true, playCombo: false });
        });
      });
      listEl.querySelectorAll("[data-play-build]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          selectHeroBuild(btn.dataset.playBuild, { switchToBuildsMode: true, playCombo: true });
          if (isMobileViewport()) setMobileTab("arena");
        });
      });
    }

    const summaryEl = document.getElementById("activeBuildSummaryBox");
    if (summaryEl) {
      const treeSplits = computeBuildTreePoints(hero, hs, activeBuild.ranks);
      const pts = totalBuildPoints(activeBuild);
      const rem = Math.max(0, MAX_SKILL_POINTS - pts);
      const curArch = getWeaponArchetype(activeBuild.weaponArchetypeId);
      const curWmb = activeBuild.weaponMiniBuildId ? getWeaponMiniBuild(activeBuild.weaponMiniBuildId) : null;
      const curGrantedSk = curWmb && curWmb.grantedSkill ? getSkill(curWmb.grantedSkill.skillId) : null;
      const curGrantedMod =
        curGrantedSk && activeBuild.skillModifiers && activeBuild.skillModifiers[curGrantedSk.id]
          ? getModifier(activeBuild.skillModifiers[curGrantedSk.id])
          : null;

      summaryEl.innerHTML = `
        <div class="mob-quick-jump-row">
          <button type="button" class="btn btn-emerald" data-mob-jump="tree">🌳 Spend Points (${pts}/${MAX_SKILL_POINTS})</button>
          <button type="button" class="btn btn-gold" data-mob-jump="arena">🎬 Watch Rotation</button>
        </div>
        <div class="build-editor-kicker">
          <span>ACTIVE BUILD DETAILS (${rem} PTS LEFT)</span>
          <button type="button" class="btn btn-xs btn-danger-outline" id="btnDeleteActiveBuild" title="Delete this build">🗑️ Delete</button>
        </div>
        <label class="build-inline-field">
          <span>Build Name</span>
          <input type="text" id="buildNameInput" value="${esc(activeBuild.name)}" placeholder="e.g. Storm-Skewer Lancer" />
        </label>
        <label class="build-inline-field">
          <span>Playstyle Identity</span>
          <input type="text" id="buildArchetypeInput" value="${esc(activeBuild.archetype || "")}" placeholder="e.g. Mid-Range Pierce &amp; Frost CC" />
        </label>

        ${
          WEAPON_ARCHETYPES.length
            ? `
          <div class="weapon-studio-card">
            <div class="weapon-studio-head">
              <span>⚔️ WEAPON ARCHETYPE &amp; FEEL</span>
              ${curArch ? `<span class="meta-pill cyan">${esc(curArch.reachBand)}</span>` : ""}
            </div>
            <select id="buildWeaponArchSelect" class="weapon-select">
              ${WEAPON_ARCHETYPES.map(
                (wa) =>
                  `<option value="${esc(wa.id)}" ${curArch && curArch.id === wa.id ? "selected" : ""}>${esc(wa.name)} (${esc(wa.hands)})</option>`
              ).join("")}
            </select>
            ${
              curArch
                ? `
              <div class="weapon-arch-readout">
                <div class="weapon-arch-trait"><strong>Intrinsic:</strong> ${esc(curArch.intrinsicTrait)}</div>
                <div class="weapon-arch-cadence"><strong>Cadence:</strong> ${esc(curArch.attackCadence)}</div>
              </div>
            `
                : ""
            }
            <label class="weapon-sub-label" for="buildWeaponMiniSelect">🗡️ Optional Unique / Runeword Weapon Mini-Build</label>
            <select id="buildWeaponMiniSelect" class="weapon-select">
              <option value="">None — Standard Class Weapon</option>
              ${WEAPON_MINI_BUILDS.map(
                (wm) =>
                  `<option value="${esc(wm.id)}" ${curWmb && curWmb.id === wm.id ? "selected" : ""}>${esc(wm.name)} (${esc(wm.tier)})</option>`
              ).join("")}
            </select>
            ${
              curWmb && curWmb.grantedSkill
                ? `
              <div class="weapon-minibuild-box">
                <div class="wmb-top-row">
                  <div>
                    <div class="wmb-title">${esc(curWmb.name)}</div>
                    <div class="wmb-insp">≈ ${esc(curWmb.d2Inspiration)}</div>
                  </div>
                  <button type="button" class="btn btn-xs btn-gold" id="btnPreviewWeaponSkill" title="Cast this weapon's granted skill in the arena">▶ Cast</button>
                </div>
                <div class="wmb-granted-line">
                  <strong>Granted Skill — ${esc(curWmb.grantedSkill.name)}:</strong> ${esc(curWmb.grantedSkill.baseBehavior)}
                </div>
                <div class="wmb-mod-label">Weapon Skill Behavior Socket (Pick 1):</div>
                <div class="wmb-mod-choices">
                  ${(curWmb.grantedSkill.modifierChoices || [])
                    .map((mc) => {
                      const active = curGrantedMod && curGrantedMod.id === mc.modifierId;
                      return `
                        <button type="button" class="wmb-mod-btn ${active ? "active" : ""}" data-wmb-mod="${esc(mc.modifierId)}" data-wmb-sid="${esc(curWmb.grantedSkill.skillId)}">
                          <span class="wmb-mod-name">${active ? "⚡ " : ""}${esc(mc.label)}</span>
                          <span class="wmb-mod-eff">${esc(mc.resultingPlaystyle)}</span>
                        </button>
                      `;
                    })
                    .join("")}
                </div>
              </div>
            `
                : ""
            }
          </div>
        `
            : ""
        }

        <div class="build-inline-field">
          <span>Points Across ${esc(meta.name)}'s 5 Trees (Tap to Open Tree)</span>
          <div class="tree-split-bars">
            ${treeSplits
              .map((s) => {
                const pct = Math.min(100, Math.round((s.pts / 60) * 100));
                return `
                  <div class="tree-split-row" data-jump-tab="${esc(s.tabId)}" title="Open ${esc(s.name)}">
                    <span class="tree-split-name">${esc(s.name)}</span>
                    <div class="tree-split-track"><div class="tree-split-fill" style="width:${pct}%"></div></div>
                    <span class="tree-split-pts">${s.pts} pt</span>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
        <label class="build-inline-field">
          <span>Gameplay Loop &amp; Build Notes</span>
          <textarea id="buildLoopTextarea" rows="3" placeholder="How this build plays: opener, crowd control, burst finisher...">${esc(activeBuild.loopNotes || "")}</textarea>
        </label>
      `;

      summaryEl.querySelectorAll("[data-mob-jump]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const dest = btn.dataset.mobJump;
          if (dest === "arena") {
            setMobileTab("arena");
            playActiveBuildCombo({ resetPack: true });
          } else {
            setMobileTab("tree");
          }
        });
      });

      const wArchSel = document.getElementById("buildWeaponArchSelect");
      if (wArchSel) {
        wArchSel.addEventListener("change", () => {
          setWeaponArchetypeOnActiveBuild(wArchSel.value);
        });
      }

      const wMiniSel = document.getElementById("buildWeaponMiniSelect");
      if (wMiniSel) {
        wMiniSel.addEventListener("change", () => {
          setWeaponMiniBuildOnActiveBuild(wMiniSel.value);
        });
      }

      const prevWpnBtn = document.getElementById("btnPreviewWeaponSkill");
      if (prevWpnBtn && curWmb && curWmb.grantedSkill) {
        prevWpnBtn.addEventListener("click", () => {
          hs.selectedSkillId = curWmb.grantedSkill.skillId;
          renderSkillBreakdown();
          renderBuildComboStage();
          triggerSkillPreview(curWmb.grantedSkill.skillId, true);
          if (isMobileViewport()) setMobileTab("arena");
        });
      }

      summaryEl.querySelectorAll("[data-wmb-mod]").forEach((btn) => {
        btn.addEventListener("click", () => {
          setSkillModifierOnActiveBuild(btn.dataset.wmbSid, btn.dataset.wmbMod);
        });
      });

      const nameInp = document.getElementById("buildNameInput");
      if (nameInp) {
        nameInp.addEventListener("change", () => {
          activeBuild.name = nameInp.value.trim() || "Unnamed Build";
          saveState();
          renderHeroSelect();
          renderBuildLoadoutDock();
          renderBuildComboStage();
          renderMobileChrome();
        });
      }

      const archInp = document.getElementById("buildArchetypeInput");
      if (archInp) {
        archInp.addEventListener("change", () => {
          activeBuild.archetype = archInp.value.trim() || "Custom Playstyle";
          saveState();
          renderBuildLoadoutDock();
          renderBuildComboStage();
        });
      }

      const loopArea = document.getElementById("buildLoopTextarea");
      if (loopArea) {
        loopArea.addEventListener("change", () => {
          activeBuild.loopNotes = loopArea.value;
          saveState();
          renderSkillBreakdown();
        });
      }

      const delBtn = document.getElementById("btnDeleteActiveBuild");
      if (delBtn) {
        delBtn.addEventListener("click", () => deleteActiveBuildFromHero(activeBuild.id));
      }

      summaryEl.querySelectorAll("[data-jump-tab]").forEach((row) => {
        row.addEventListener("click", () => {
          hs.activeTab = row.dataset.jumpTab;
          saveState({ skipServer: true });
          renderSkillTree();
          if (isMobileViewport()) setMobileTab("tree");
        });
      });
    }
  }

  function renderBuildComboStage() {
    const stage = document.getElementById("buildComboStage");
    if (!stage) return;
    const isBuilds = normalizeMode(state.activeMode) === "builds";
    stage.classList.toggle("hidden", !isBuilds);
    if (!isBuilds) return;

    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const rotIds = deriveBuildRotationIds(activeBuild, hs);
    const explicitMap = new Map(((activeBuild.rotation || []).filter(Boolean)).map((r) => [r.skillId, r]));
    const selSk = getSkill(hs.selectedSkillId);
    const selInCombo = (activeBuild.rotation || []).some((r) => r && r.skillId === selSk.id);
    const curArch = getWeaponArchetype(activeBuild.weaponArchetypeId);
    const curWmb = activeBuild.weaponMiniBuildId ? getWeaponMiniBuild(activeBuild.weaponMiniBuildId) : null;

    stage.innerHTML = `
      <div class="combo-stage-head">
        <div class="combo-stage-title">
          <span>🎬 ${esc(activeBuild.name.toUpperCase())} — GAMEPLAY ROTATION</span>
          <span class="combo-dna-tag">${esc(curWmb ? `🗡️ ${curWmb.name}` : curArch ? `⚔️ ${curArch.name}` : activeBuild.archetype || "Custom Playstyle")}</span>
        </div>
        <div class="combo-stage-btns">
          <button type="button" class="btn btn-xs btn-gold" id="btnPlayBuildCombo">▶ Play Build Combo</button>
          <button type="button" class="btn btn-xs btn-outline ${state.comboLoop ? "active" : ""}" id="btnToggleComboLoop" title="Continuously loop the entire build combo in the arena">⟳ Loop Combo: ${state.comboLoop ? "ON" : "OFF"}</button>
          <button type="button" class="btn btn-xs btn-outline" id="btnSyncRotationPts" title="Auto-fill rotation from your top invested skills">🪄 Sync From Points</button>
          <button type="button" class="btn btn-xs btn-emerald" id="btnToggleSelectedInCombo" title="Add or remove the currently inspected skill in this build's rotation">${selInCombo ? "★ In Combo" : "＋ Add Selected"}</button>
        </div>
      </div>
      <div class="combo-step-strip">
        ${
          rotIds.length
            ? rotIds
                .map((sid, idx) => {
                  const sk = getSkill(sid);
                  const stepMeta = explicitMap.get(sid);
                  const rk = activeBuild.ranks[sid] || 0;
                  const modObj = getActiveSkillModifierForBuild(sid, activeBuild);
                  const castingNow = arena && arena.activeComboSkillId === sid && arena.activeComboIndex === idx;
                  return `
                    <div class="combo-step-card ${castingNow ? "casting-now" : ""} ${modObj ? "has-active-mod" : ""}" data-combo-step-idx="${idx}" data-combo-skill-id="${esc(sid)}" title="${esc((stepMeta && stepMeta.note) || sk.bcExactInteraction || sk.mechanic || "")}">
                      <img src="${esc(sk.icon)}" alt="${esc(sk.name)}" />
                      <div class="combo-step-meta">
                        <div class="combo-step-role">${esc((stepMeta && stepMeta.role) || `${idx + 1}. Step ${idx + 1}`)}</div>
                        <div class="combo-step-name">${esc(sk.name)}</div>
                        <div class="combo-step-rk">${sk.isWeaponGranted ? "🗡️ Weapon Skill" : `Rank ${rk} / ${sk.maxRank || 20}`}</div>
                        ${modObj ? `<div class="combo-step-mod">⚡ ${esc(modObj.name.split("(")[0].trim())}</div>` : ""}
                      </div>
                      ${
                        stepMeta
                          ? `<button type="button" class="combo-step-remove" data-remove-combo-sid="${esc(sid)}" title="Remove step">✕</button>`
                          : ""
                      }
                    </div>
                  `;
                })
                .join("")
            : `<div class="muted-sub">Invest points in tree nodes or click <b>＋ Add Selected</b> to define this build's combat loop.</div>`
        }
      </div>
    `;

    const playBtn = document.getElementById("btnPlayBuildCombo");
    if (playBtn) {
      playBtn.addEventListener("click", () => playActiveBuildCombo({ resetPack: true }));
    }
    const loopBtn = document.getElementById("btnToggleComboLoop");
    if (loopBtn) {
      loopBtn.addEventListener("click", () => {
        state.comboLoop = !state.comboLoop;
        if (state.comboLoop) {
          playActiveBuildCombo({ resetPack: true });
        } else {
          arena.comboQueue = [];
          arena.activeComboSkillId = null;
          arena.activeComboIndex = -1;
          renderBuildComboStage();
        }
      });
    }
    const syncBtn = document.getElementById("btnSyncRotationPts");
    if (syncBtn) {
      syncBtn.addEventListener("click", () => syncActiveBuildRotationFromPoints(false));
    }
    const toggleSelBtn = document.getElementById("btnToggleSelectedInCombo");
    if (toggleSelBtn) {
      toggleSelBtn.addEventListener("click", () => toggleSkillInActiveBuildRotation(selSk.id));
    }

    stage.querySelectorAll("[data-combo-skill-id]").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest("[data-remove-combo-sid]")) return;
        const sid = card.dataset.comboSkillId;
        state.comboLoop = false;
        arena.comboQueue = [];
        arena.activeComboSkillId = sid;
        arena.activeComboIndex = parseInt(card.dataset.comboStepIdx, 10) || 0;
        hs.selectedSkillId = sid;
        renderSkillTree();
        renderSkillBreakdown();
        renderBuildComboStage();
        triggerSkillPreview(sid, true);
      });
    });

    stage.querySelectorAll("[data-remove-combo-sid]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSkillInActiveBuildRotation(btn.dataset.removeComboSid);
      });
    });
  }

  // ==========================================================================
  // 4. DOCKED SKILL PALETTE (SEARCH, TAGS, DRAG-AND-DROP & 1-CLICK SLOTTING)
  // ==========================================================================
  function getActiveClassTreeIndex(hs) {
    if (hs.activeTab === "tree2") return 1;
    if (hs.activeTab === "tree3") return 2;
    return 0;
  }

  function setTargetSlot(slotOrNull) {
    targetSlot = slotOrNull;
    if (targetSlot && state.paletteCollapsed) {
      state.paletteCollapsed = false;
      syncWorkspaceLayout();
    }
    renderSkillPalette();
    renderSkillTree();
  }

  function slotSkillIntoActiveHero(skillId, explicitSlot) {
    const hs = currentHeroState();
    const sk = getSkill(skillId);
    if (!sk) return;

    pushUndoSnapshot();

    let treeIdx;
    let tier;
    let col;
    const chosenTarget = explicitSlot || targetSlot;

    if (chosenTarget) {
      treeIdx = chosenTarget.treeIdx;
      tier = chosenTarget.tier;
      col = chosenTarget.col;
      hs.activeTab = `tree${treeIdx + 1}`;
    } else {
      if (hs.activeTab === "tree4" || hs.activeTab === "tree5") {
        hs.activeTab = "tree1";
      }
      treeIdx = getActiveClassTreeIndex(hs);
      const cells = hs.treeGrid[treeIdx] || {};
      const prefTier = Math.min(4, Math.max(1, sk.tier || 1));
      let found = null;
      for (let c = 0; c < 3; c++) {
        if (!cells[`${prefTier}_${c}`]) {
          found = { tier: prefTier, col: c };
          break;
        }
      }
      if (!found) {
        for (let t = 1; t <= 4 && !found; t++) {
          for (let c = 0; c < 3; c++) {
            if (!cells[`${t}_${c}`]) {
              found = { tier: t, col: c };
              break;
            }
          }
        }
      }
      if (found) {
        tier = found.tier;
        col = found.col;
      } else {
        // Replace currently selected node if it lives in this tree, else Tier I Col 2
        const existingEntry = Object.entries(cells).find(([, id]) => id === hs.selectedSkillId);
        if (existingEntry) {
          const [tStr, cStr] = existingEntry[0].split("_");
          tier = parseInt(tStr, 10);
          col = parseInt(cStr, 10);
        } else {
          tier = prefTier;
          col = 1;
        }
      }
    }

    // Remove duplicate instance of the same skill ID in the same tree so arrows stay 1-to-1
    const cells = hs.treeGrid[treeIdx];
    Object.keys(cells).forEach((k) => {
      if (cells[k] === skillId && k !== `${tier}_${col}`) {
        delete cells[k];
      }
    });

    cells[`${tier}_${col}`] = skillId;
    hs.ranks[skillId] = Math.max(1, hs.ranks[skillId] || 1);
    hs.selectedSkillId = skillId;
    hs.presetId = "";
    targetSlot = null;
    if (isMobileViewport()) {
      state.activeMode = "trees";
      state.mobileTab = "tree";
    }

    saveState();
    renderAll();
    triggerSkillPreview(skillId, true);
    showToast(`＋ Slotted "${sk.name}" into Tree ${treeIdx + 1} · Tier ${TIER_META[tier - 1].roman}, Col ${col + 1}`);
  }

  function ripSkillFromCell(treeIdx, key) {
    const hs = currentHeroState();
    const cells = hs.treeGrid[treeIdx];
    if (!cells || !cells[key]) return;
    const sid = cells[key];
    const sk = getSkill(sid);
    pushUndoSnapshot();
    delete cells[key];
    if (hs.prereqByTree && hs.prereqByTree[treeIdx]) {
      delete hs.prereqByTree[treeIdx][sid];
      Object.keys(hs.prereqByTree[treeIdx]).forEach((otherId) => {
        if (hs.prereqByTree[treeIdx][otherId] === sid) {
          delete hs.prereqByTree[treeIdx][otherId];
        }
      });
    }
    if (targetSlot && `${targetSlot.tier}_${targetSlot.col}` === key && targetSlot.treeIdx === treeIdx) {
      targetSlot = null;
    }
    hs.presetId = "";
    saveState();
    renderAll();
    showToast(`✕ Ripped "${sk.name}" from slot (Ctrl+Z to undo)`);
  }

  function populateFilterDropdowns() {
    const gameSel = document.getElementById("paletteGameSelect");
    if (gameSel) {
      const cur = paletteState.game;
      gameSel.innerHTML = SOURCE_GAMES.map(
        (g) => `<option value="${esc(g)}" ${cur === g ? "selected" : ""}>${g === "ALL" ? "All Games" : esc(g)}</option>`
      ).join("");
    }
    const heroSel = document.getElementById("paletteHeroSelect");
    if (heroSel) {
      const heroNames = ["ALL", ...DATA.heroes.map((h) => h.name), "Universal", "Custom"];
      const cur = paletteState.hero;
      heroSel.innerHTML = heroNames
        .map(
          (hn) =>
            `<option value="${esc(hn)}" ${cur === hn ? "selected" : ""}>${hn === "ALL" ? "All Heroes" : esc(hn)}</option>`
        )
        .join("");
    }
  }

  function renderSkillPalette() {
    populateFilterDropdowns();

    const hs = currentHeroState();
    const searchEl = document.getElementById("paletteSearchInput");
    if (searchEl && searchEl.value !== paletteState.search) {
      searchEl.value = paletteState.search;
    }

    // Target slot banner
    const bannerEl = document.getElementById("targetSlotBanner");
    if (bannerEl) {
      if (targetSlot) {
        const curCellKey = `${targetSlot.tier}_${targetSlot.col}`;
        const curId = (hs.treeGrid[targetSlot.treeIdx] || {})[curCellKey];
        const curSk = curId ? getSkill(curId) : null;
        bannerEl.classList.remove("hidden");
        bannerEl.innerHTML = `
          <div class="target-slot-top">
            <span>🎯 Targeting Tree ${targetSlot.treeIdx + 1} · Tier ${TIER_META[targetSlot.tier - 1].roman}, Col ${targetSlot.col + 1}</span>
            <button type="button" class="btn btn-xs btn-outline" id="btnCancelTargetSlot">Cancel</button>
          </div>
          <div class="target-slot-opts">
            <span>${curSk ? `Replacing: <b>${esc(curSk.name)}</b>` : "Empty slot — click <b>＋ Put Here</b> on any skill below"}</span>
            ${
              curSk
                ? `<button type="button" class="btn btn-xs btn-danger-outline" id="btnRipTargetedNow">✕ Rip Empty</button>`
                : ""
            }
          </div>
        `;
        const cancelBtn = document.getElementById("btnCancelTargetSlot");
        if (cancelBtn) cancelBtn.addEventListener("click", () => setTargetSlot(null));
        const ripBtn = document.getElementById("btnRipTargetedNow");
        if (ripBtn) {
          ripBtn.addEventListener("click", () => ripSkillFromCell(targetSlot.treeIdx, curCellKey));
        }
      } else {
        bannerEl.classList.add("hidden");
        bannerEl.innerHTML = "";
      }
    }

    // Tag pills
    const tagBox = document.getElementById("paletteTagPills");
    if (tagBox) {
      tagBox.innerHTML = TAG_FILTERS.map(
        (t) =>
          `<button type="button" class="mini-tag-pill ${paletteState.tag === t ? "active" : ""}" data-ptag="${esc(t)}">${esc(t)}</button>`
      ).join("");
      tagBox.querySelectorAll("[data-ptag]").forEach((b) => {
        b.addEventListener("click", () => {
          paletteState.tag = b.dataset.ptag;
          renderSkillPalette();
        });
      });
    }

    const allList = Array.from(ALL_SKILLS.values());
    const filtered = allList.filter((sk) => skillMatchesFilters(sk, paletteState));

    const countLbl = document.getElementById("paletteCountLabel");
    if (countLbl) countLbl.textContent = `${filtered.length}`;
    const codexBadge = document.getElementById("codexCountBadge");
    if (codexBadge) codexBadge.textContent = `${allList.length}`;

    const listEl = document.getElementById("paletteSkillList");
    if (!listEl) return;

    if (!filtered.length) {
      listEl.innerHTML = `<div style="padding:18px 10px;text-align:center;color:var(--text-dim);font-size:11.5px;">No skills match your filter. Clear filters or click <b>✨ + New Skill</b> above!</div>`;
      return;
    }

    listEl.innerHTML = filtered
      .map((sk) => {
        const iconSrc = sk.icon || "assets/icons/d2r/ama_jab.png";
        const isSel = hs.selectedSkillId === sk.id ? "selected" : "";
        const slotLabel = targetSlot ? "＋ Put Here" : "＋ Slot";
        return `
          <div class="palette-card ${isSel}" draggable="true" data-palette-skill="${esc(sk.id)}">
            <img src="${esc(iconSrc)}" alt="${esc(sk.name)}" loading="lazy" />
            <div class="palette-card-body">
              <div class="palette-card-title">${esc(sk.name)}</div>
              <div class="palette-card-sub">T${sk.tier || 1} · ${esc(shortOriginTag(sk))} · ${esc(sk.originHero || "Custom")}</div>
              <div class="palette-card-desc">${esc(sk.bcExactInteraction || sk.mechanic)}</div>
              <div class="palette-card-actions">
                <button type="button" class="btn btn-xs btn-gold" data-pal-slot="${esc(sk.id)}">${slotLabel}</button>
                <button type="button" class="btn btn-xs btn-outline" data-pal-preview="${esc(sk.id)}">▶ Cast</button>
                <button type="button" class="btn btn-xs btn-outline" data-pal-edit="${esc(sk.id)}" title="Edit skill properties & icon">✏️</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    listEl.querySelectorAll("[data-palette-skill]").forEach((card) => {
      const sid = card.dataset.paletteSkill;
      card.addEventListener("dragstart", (e) => {
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("application/x-bc-palette-skill", sid);
        e.dataTransfer.setData("text/plain", sid);
      });
      card.addEventListener("click", (e) => {
        if (e.target.closest("button")) return;
        hs.selectedSkillId = sid;
        triggerSkillPreview(sid, true);
        saveState();
        renderSkillBreakdown();
        syncSelectedHighlights();
      });
    });

    listEl.querySelectorAll("[data-pal-preview]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sid = btn.dataset.palPreview;
        hs.selectedSkillId = sid;
        triggerSkillPreview(sid, true);
        saveState();
        renderSkillBreakdown();
        syncSelectedHighlights();
        if (isMobileViewport()) setMobileTab("arena");
      });
    });

    listEl.querySelectorAll("[data-pal-slot]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        slotSkillIntoActiveHero(btn.dataset.palSlot);
      });
    });

    listEl.querySelectorAll("[data-pal-edit]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        openNodeEditorForSkill(btn.dataset.palEdit);
      });
    });
  }

  function syncSelectedHighlights() {
    const sid = currentHeroState().selectedSkillId;
    document.querySelectorAll("[data-select-skill]").forEach((el) => {
      el.classList.toggle("selected", el.dataset.selectSkill === sid);
    });
    document.querySelectorAll("[data-palette-skill]").forEach((el) => {
      el.classList.toggle("selected", el.dataset.paletteSkill === sid);
    });
  }

  // ==========================================================================
  // 5. CENTER 4x3 ICON SKILL TREE (DRAG, SWAP, RIP, EDIT & PREREQ ARROWS)
  // ==========================================================================
  function getActiveTreeDefinition(hero, hs) {
    if (hs.activeTab === "tree4" || hs.activeTab === "tree5") {
      const idx = hs.activeTab === "tree4" ? 0 : 1;
      const ut = DATA.universalTrees[idx];
      const cells = {};
      const used = { 1: new Set(), 2: new Set(), 3: new Set(), 4: new Set() };
      ut.skills.forEach((s) => {
        const tier = Math.min(4, Math.max(1, s.tier || 1));
        let col = typeof s.col === "number" ? s.col : 1;
        while (used[tier].has(col)) col = (col + 1) % 3;
        used[tier].add(col);
        cells[`${tier}_${col}`] = s.id;
      });
      const levyRank = hs.ranks["cmd_mercenary_levy"] || 0;
      const troopBonus = levyRank >= 5 ? 10 : levyRank >= 3 ? 5 : 0;
      return {
        isUniversal: true,
        treeIdx: null,
        title: `Universal Tree ${ut.slotNumber}: ${ut.name}`,
        subtitle: ut.hardCapRule || ut.milestoneRule || ut.purpose,
        cells,
        footerRule:
          idx === 0
            ? `⚡ Global Stamina Regen Bonus: +${Math.min(50, (hs.ranks["mob_second_wind"] || 0) * 10)}% / 50% Hard Cap`
            : `🚩 Warband Troop Cap: ${12 + troopBonus} Max Troops (+5 at Rank 3 & Rank 5)`,
      };
    }

    const meta = getHeroDisplayMeta(hero);
    const treeIdx = getActiveClassTreeIndex(hs);
    const ct = meta.trees[treeIdx];
    return {
      isUniversal: false,
      treeIdx,
      title: `Tree ${treeIdx + 1}: ${ct.name}`,
      subtitle: `Weapon Focus: ${ct.weaponFocus} — ${ct.theme}`,
      cells: hs.treeGrid[treeIdx] || {},
      footerRule: `💡 Drag skills from the left palette or between cells · Hover any node for [⇄ Replace], [✏️ Edit], or [✕ Rip].`,
    };
  }

  function getEffectivePrereq(hs, def, sid) {
    const sk = getSkill(sid);
    if (!sk) return "";
    if (!def.isUniversal && hs.prereqByTree && hs.prereqByTree[def.treeIdx]) {
      const map = hs.prereqByTree[def.treeIdx];
      if (Object.prototype.hasOwnProperty.call(map, sid)) {
        return map[sid] || "";
      }
    }
    return sk.prereq || "";
  }

  function autoWireActiveTree() {
    const hero = currentHero();
    const hs = currentHeroState();
    const def = getActiveTreeDefinition(hero, hs);
    if (def.isUniversal) return;

    pushUndoSnapshot();
    const tIdx = def.treeIdx;
    const cells = hs.treeGrid[tIdx] || {};
    if (!hs.prereqByTree) hs.prereqByTree = [{}, {}, {}];
    const pmap = {};

    for (let tier = 1; tier <= 4; tier++) {
      for (let col = 0; col < 3; col++) {
        const sid = cells[`${tier}_${col}`];
        if (!sid) continue;
        if (tier === 1) {
          pmap[sid] = "";
          continue;
        }
        let linked = "";
        for (let upTier = tier - 1; upTier >= 1 && !linked; upTier--) {
          const colOrder = [col, (col + 1) % 3, (col + 2) % 3].sort(
            (a, b) => Math.abs(a - col) - Math.abs(b - col)
          );
          for (const c of colOrder) {
            const cand = cells[`${upTier}_${c}`];
            if (cand && cand !== sid) {
              linked = cand;
              break;
            }
          }
        }
        pmap[sid] = linked;
      }
    }

    hs.prereqByTree[tIdx] = pmap;
    saveState();
    renderSkillTree();
    showToast(`⚡ Auto-wired prerequisite arrows for Tree ${tIdx + 1}`);
  }

  function pointsInTab(hs, tabId) {
    if (tabId === "tree4" || tabId === "tree5") {
      const ut = DATA.universalTrees[tabId === "tree4" ? 0 : 1];
      return ut.skills.reduce((s, x) => s + (hs.ranks[x.id] || 0), 0);
    }
    const idx = tabId === "tree2" ? 1 : tabId === "tree3" ? 2 : 0;
    const cells = hs.treeGrid[idx] || {};
    return Object.values(cells).reduce((s, sid) => s + (hs.ranks[sid] || 0), 0);
  }

  function adjustBuildSkillRank(skillId, rawDelta, treeDef) {
    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const sk = getSkill(skillId);
    if (!sk) return;
    const maxR = sk.maxRank || 20;
    const cur = activeBuild.ranks[skillId] || 0;

    if (rawDelta > 0) {
      let spent = totalBuildPoints(activeBuild);
      if (spent >= MAX_SKILL_POINTS) {
        showToast(`⚠️ All ${MAX_SKILL_POINTS} build points are spent — Right-Click a skill to refund points!`);
        return;
      }
      if (cur >= maxR) return;

      pushUndoSnapshot();
      // Auto-invest 1 point in any uninvested prerequisite chain in this tree so builds feel snappy
      if (treeDef && !treeDef.isUniversal) {
        const chain = [];
        let pId = getEffectivePrereq(hs, treeDef, skillId);
        const seen = new Set();
        while (pId && !seen.has(pId)) {
          seen.add(pId);
          if ((activeBuild.ranks[pId] || 0) === 0) chain.unshift(pId);
          pId = getEffectivePrereq(hs, treeDef, pId);
        }
        chain.forEach((reqId) => {
          if (spent < MAX_SKILL_POINTS) {
            activeBuild.ranks[reqId] = 1;
            spent += 1;
          }
        });
      }

      const room = Math.max(0, MAX_SKILL_POINTS - spent);
      const add = Math.min(rawDelta, maxR - (activeBuild.ranks[skillId] || 0), room);
      if (add > 0) {
        activeBuild.ranks[skillId] = (activeBuild.ranks[skillId] || 0) + add;
      }
      hs.ranks = activeBuild.ranks;
      hs.selectedSkillId = skillId;
      triggerSkillPreview(skillId, false);
      saveState();
      renderAll();
    } else if (rawDelta < 0) {
      if (cur <= 0) return;
      pushUndoSnapshot();
      const nextVal = Math.max(0, cur + rawDelta);
      if (nextVal <= 0) delete activeBuild.ranks[skillId];
      else activeBuild.ranks[skillId] = nextVal;
      hs.ranks = activeBuild.ranks;
      hs.selectedSkillId = skillId;
      saveState();
      renderAll();
    }
  }

  function renderSkillTree() {
    const hero = currentHero();
    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const meta = getHeroDisplayMeta(hero);
    const mode = normalizeMode(state.activeMode);
    const isBuilds = mode === "builds";
    const tabsEl = document.getElementById("treeTabsBar");

    const tabs = [
      { id: "tree1", num: "Tree I", name: meta.trees[0].name.split("&")[0].trim() },
      { id: "tree2", num: "Tree II", name: meta.trees[1].name.split("&")[0].trim() },
      { id: "tree3", num: "Tree III", name: meta.trees[2].name.split("&")[0].trim() },
      { id: "tree4", num: "Tree IV", name: "Mobility" },
      { id: "tree5", num: "Tree V", name: "Warband" },
    ];

    tabsEl.innerHTML = tabs
      .map((t) => {
        const pts = pointsInTab(hs, t.id);
        return `
          <button type="button" class="tree-tab ${hs.activeTab === t.id ? "active" : ""}" data-tab="${t.id}">
            <span class="tree-tab-num">${esc(t.num)}</span>
            <span class="tree-tab-name">${esc(t.name)}</span>
            <span class="tree-tab-pts">${isBuilds ? `${pts} pts` : t.id === "tree4" || t.id === "tree5" ? "Shared" : `${Object.keys(hs.treeGrid[parseInt(t.id.slice(-1), 10) - 1] || {}).length} skills`}</span>
          </button>
        `;
      })
      .join("");

    tabsEl.querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        hs.activeTab = btn.dataset.tab;
        targetSlot = null;
        const def = getActiveTreeDefinition(hero, hs);
        const firstId = Object.values(def.cells)[0];
        if (firstId) {
          hs.selectedSkillId = firstId;
          triggerSkillPreview(firstId, true);
        }
        saveState();
        renderAll();
      });
    });

    // Context Banner at the top of the Center Skill Tree Panel
    const ctxBar = document.getElementById("treeModeContextBar");
    if (ctxBar) {
      if (isBuilds) {
        const pts = totalBuildPoints(activeBuild);
        const rem = Math.max(0, MAX_SKILL_POINTS - pts);
        ctxBar.className = "tree-mode-context-bar builds-mode";
        ctxBar.innerHTML = `
          <div>
            <b>⚔️ BUILD CALCULATOR — ${esc(activeBuild.name)} (${pts}/${MAX_SKILL_POINTS} pts · ${rem} left):</b>
            Click any skill to invest <b>+1</b> · <b>Shift+Click +5</b> · <b>Right-Click −1</b> · Click <b>★</b> to add to gameplay combo.
          </div>
          <button type="button" class="btn btn-xs btn-outline" id="btnTreeBarToArchitect">🛠️ Edit ${esc(meta.name)}'s Trees</button>
        `;
        const toArchBtn = document.getElementById("btnTreeBarToArchitect");
        if (toArchBtn) toArchBtn.addEventListener("click", () => setActiveMode("trees"));
      } else {
        ctxBar.className = "tree-mode-context-bar architect-mode";
        ctxBar.innerHTML = `
          <div>
            <b>🛠️ SKILL TREE ARCHITECT — ${esc(meta.name)} Class Kit:</b>
            Slot, drag, swap, edit, or rip skills across all 3 class trees. Ready to test a build?
          </div>
          <button type="button" class="btn btn-xs btn-emerald" id="btnTreeBarToBuilds">⚔️ Make / View Builds (${(hs.builds || []).length}) →</button>
        `;
        const toBuildsBtn = document.getElementById("btnTreeBarToBuilds");
        if (toBuildsBtn) {
          toBuildsBtn.addEventListener("click", () => {
            setActiveMode("builds");
            playActiveBuildCombo({ resetPack: true });
          });
        }
      }
    }

    const def = getActiveTreeDefinition(hero, hs);
    document.getElementById("activeTreeTitle").textContent = def.title;
    document.getElementById("activeTreeSubtitle").textContent = def.subtitle;
    document.getElementById("treeRuleFooter").textContent = isBuilds
      ? def.isUniversal
        ? def.footerRule
        : `⚔️ Spending points for "${activeBuild.name}" — Click +1 · Shift+Click +5 · Right-Click −1 · ★ toggles skill in live combo rotation.`
      : def.footerRule;

    // Show structural buttons in Tree Architect mode; show Zero Build Points in Builds mode
    ["btnEditTreeMeta", "btnAutoWireTree", "btnEmptyTreeSlots"].forEach((btnId) => {
      const b = document.getElementById(btnId);
      if (b) {
        b.disabled = def.isUniversal;
        b.classList.toggle("hidden", isBuilds);
      }
    });
    const clearPtsBtn = document.getElementById("btnClearTreePoints");
    if (clearPtsBtn) {
      clearPtsBtn.classList.toggle("hidden", !isBuilds);
      clearPtsBtn.textContent = "↺ Zero Build Points";
    }

    const rotationSet = new Set(((activeBuild.rotation || []).filter(Boolean)).map((r) => r.skillId));
    const gridEl = document.getElementById("treeGridCells");
    let html = "";
    TIER_META.forEach((tm) => {
      html += `
        <div class="tier-rail-label">
          <span class="tier-roman">TIER ${tm.roman}</span>
          <span class="tier-sub">${tm.sub}</span>
        </div>
      `;
      for (let col = 0; col < 3; col++) {
        const key = `${tm.tier}_${col}`;
        const sid = def.cells[key];
        const isTargeted =
          !isBuilds &&
          !def.isUniversal &&
          targetSlot &&
          targetSlot.treeIdx === def.treeIdx &&
          targetSlot.tier === tm.tier &&
          targetSlot.col === col;

        if (sid && ALL_SKILLS.has(sid)) {
          const sk = getSkill(sid);
          const rk = hs.ranks[sid] || 0;
          const maxR = sk.maxRank || 20;
          const isSel = hs.selectedSkillId === sid;
          const iconSrc = sk.icon || "assets/icons/d2r/ama_jab.png";
          const inCombo = rotationSet.has(sid);

          if (isBuilds) {
            const rankClasses = rk >= maxR ? "invested maxed-rank" : rk > 0 ? "invested" : "uninvested";
            const activeMod = getActiveSkillModifierForBuild(sid, activeBuild);
            html += `
              <div class="tree-cell" data-cell-key="${key}" data-skill-node="${esc(sid)}">
                <div class="skill-node build-mode-node ${isSel ? "selected" : ""} ${rankClasses} ${activeMod ? "has-socketed-mod" : ""}"
                     data-select-skill="${esc(sid)}"
                     data-node-cell="${key}"
                     title="Click: +1 pt · Shift+Click: +5 pts · Right-Click: −1 pt${activeMod ? ` · Socketed: ${activeMod.name}` : ""}">
                  ${activeMod ? `<span class="node-mod-badge" title="Socketed Behavior Modifier: ${esc(activeMod.name)}">⚡</span>` : ""}
                  <button type="button" class="node-combo-star ${inCombo ? "in-combo" : ""}" data-combo-toggle="${esc(sid)}" title="${inCombo ? "In Build Combo Rotation (click to remove)" : "Add skill to Build Combo Rotation"}">★</button>
                  <div class="skill-icon-box">
                    <img src="${esc(iconSrc)}" alt="${esc(sk.name)}" />
                    <span class="origin-mini-tag">${esc(shortOriginTag(sk))}</span>
                  </div>
                  <div class="skill-node-title">${esc(sk.name.split("(")[0].trim())}</div>
                  <div class="rank-stepper">
                    <button type="button" class="rank-btn" data-rank-step="dec" data-rank-id="${esc(sid)}">−</button>
                    <span class="rank-val">${rk}/${maxR}</span>
                    <button type="button" class="rank-btn" data-rank-step="inc" data-rank-id="${esc(sid)}">+</button>
                  </div>
                </div>
              </div>
            `;
          } else {
            html += `
              <div class="tree-cell" data-cell-key="${key}" data-skill-node="${esc(sid)}">
                <div class="skill-node ${isSel ? "selected" : ""} ${isTargeted ? "slot-targeted" : ""}"
                     ${!def.isUniversal ? `draggable="true" data-drag-cell="${key}"` : ""}
                     data-select-skill="${esc(sid)}"
                     data-node-cell="${key}">
                  ${
                    !def.isUniversal
                      ? `<div class="node-mini-tools">
                          <div class="node-mini-group">
                            <button type="button" class="node-tool-btn" data-node-swap="${key}" title="Target slot to replace from left palette">⇄</button>
                            <button type="button" class="node-tool-btn" data-node-edit="${key}" title="Edit skill node properties & icon">✏️</button>
                          </div>
                          <div class="node-mini-group">
                            <button type="button" class="node-tool-btn rip" data-node-rip="${key}" title="Rip skill from slot (Delete / Shift+Right-Click)">✕</button>
                          </div>
                        </div>`
                      : ""
                  }
                  <div class="skill-icon-box">
                    <img src="${esc(iconSrc)}" alt="${esc(sk.name)}" />
                    <span class="origin-mini-tag">${esc(shortOriginTag(sk))}</span>
                  </div>
                  <div class="skill-node-title">${esc(sk.name.split("(")[0].trim())}</div>
                  <div class="architect-tier-pill">${esc((sk.castType || "Active").split("(")[0].trim())}</div>
                </div>
              </div>
            `;
          }
        } else if (!def.isUniversal && !isBuilds) {
          html += `
            <div class="tree-cell" data-cell-key="${key}">
              <button type="button" class="empty-tree-slot ${isTargeted ? "slot-targeted" : ""}" data-empty-cell="${key}">
                <span>＋ Slot Skill</span>
                <span class="empty-slot-sub">${isTargeted ? "Pick from Palette" : "Click or Drag Here"}</span>
              </button>
            </div>
          `;
        } else {
          html += `<div class="tree-cell"></div>`;
        }
      }
    });

    gridEl.innerHTML = html;

    // Node Click / Right-Click / Double-Click / DragStart
    gridEl.querySelectorAll("[data-select-skill]").forEach((node) => {
      node.addEventListener("click", (e) => {
        if (
          e.target.closest("[data-rank-step]") ||
          e.target.closest(".node-tool-btn") ||
          e.target.closest("[data-combo-toggle]")
        ) {
          return;
        }
        const sid = node.dataset.selectSkill;
        if (isBuilds && !isMobileViewport()) {
          const step = e.shiftKey ? 5 : 1;
          hs.selectedSkillId = sid;
          const before = activeBuild.ranks[sid] || 0;
          const sk = getSkill(sid);
          if (before < (sk.maxRank || 20) && totalBuildPoints(activeBuild) < MAX_SKILL_POINTS) {
            adjustBuildSkillRank(sid, step, def);
          } else {
            triggerSkillPreview(sid, true);
            saveState({ skipServer: true });
            renderSkillBreakdown();
            renderBuildComboStage();
            syncSelectedHighlights();
            renderMobileTreeActionDock();
          }
          return;
        }

        hs.selectedSkillId = sid;
        triggerSkillPreview(sid, true);
        saveState({ skipServer: isBuilds });
        renderSkillBreakdown();
        if (isBuilds) renderBuildComboStage();
        syncSelectedHighlights();
        renderMobileTreeActionDock();
      });

      node.addEventListener("dblclick", (e) => {
        if (isBuilds) return;
        if (e.target.closest("[data-rank-step]") || e.target.closest(".node-tool-btn")) return;
        const key = node.dataset.nodeCell;
        if (!def.isUniversal && key) {
          openNodeEditorForCell(def.treeIdx, key);
        } else {
          openNodeEditorForSkill(node.dataset.selectSkill);
        }
      });

      node.addEventListener("contextmenu", (e) => {
        if (isBuilds) {
          e.preventDefault();
          const sid = node.dataset.selectSkill;
          adjustBuildSkillRank(sid, e.shiftKey ? -5 : -1, def);
          return;
        }
        if (!def.isUniversal && e.shiftKey && node.dataset.nodeCell) {
          e.preventDefault();
          ripSkillFromCell(def.treeIdx, node.dataset.nodeCell);
        }
      });

      if (!isBuilds && !def.isUniversal && node.dataset.dragCell) {
        node.addEventListener("dragstart", (e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("application/x-bc-tree-cell", node.dataset.dragCell);
          e.dataTransfer.setData("text/plain", node.dataset.selectSkill);
        });
      }
    });

    // Combo Star Toggle in Builds Mode
    gridEl.querySelectorAll("[data-combo-toggle]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleSkillInActiveBuildRotation(btn.dataset.comboToggle);
      });
    });

    // Rank Stepper (- / +) in Builds Mode
    gridEl.querySelectorAll("[data-rank-step]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sid = btn.dataset.rankId;
        const stepMag = e.shiftKey ? 5 : 1;
        const delta = btn.dataset.rankStep === "inc" ? stepMag : -stepMag;
        adjustBuildSkillRank(sid, delta, def);
      });
    });

    // Mini Tools on Class Tree Nodes + Empty Slot Targeting + Drag-and-Drop Cells (Skill Tree Architect Mode)
    if (!isBuilds && !def.isUniversal) {
      gridEl.querySelectorAll("[data-node-swap], [data-empty-cell]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const key = btn.dataset.nodeSwap || btn.dataset.emptyCell;
          const [tStr, cStr] = key.split("_");
          const tier = parseInt(tStr, 10);
          const col = parseInt(cStr, 10);
          const same =
            targetSlot &&
            targetSlot.treeIdx === def.treeIdx &&
            targetSlot.tier === tier &&
            targetSlot.col === col;
          setTargetSlot(same ? null : { treeIdx: def.treeIdx, tier, col });
          if (!same) {
            if (isMobileViewport()) {
              setMobileTab("skills");
            } else {
              const pSearch = document.getElementById("paletteSearchInput");
              if (pSearch) pSearch.focus();
            }
          }
        });
      });

      gridEl.querySelectorAll("[data-node-edit]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          openNodeEditorForCell(def.treeIdx, btn.dataset.nodeEdit);
        });
      });

      gridEl.querySelectorAll("[data-node-rip]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          ripSkillFromCell(def.treeIdx, btn.dataset.nodeRip);
        });
      });

      gridEl.querySelectorAll("[data-cell-key]").forEach((cellEl) => {
        const toKey = cellEl.dataset.cellKey;
        cellEl.addEventListener("dragover", (e) => {
          e.preventDefault();
          cellEl.classList.add("drag-over");
        });
        cellEl.addEventListener("dragleave", () => {
          cellEl.classList.remove("drag-over");
        });
        cellEl.addEventListener("drop", (e) => {
          e.preventDefault();
          cellEl.classList.remove("drag-over");
          const fromCellKey = e.dataTransfer.getData("application/x-bc-tree-cell");
          const paletteSkillId =
            e.dataTransfer.getData("application/x-bc-palette-skill") || e.dataTransfer.getData("text/plain");
          const [tStr, cStr] = toKey.split("_");
          const toTier = parseInt(tStr, 10);
          const toCol = parseInt(cStr, 10);

          if (fromCellKey) {
            if (fromCellKey === toKey) return;
            const cells = hs.treeGrid[def.treeIdx];
            const movingId = cells[fromCellKey];
            if (!movingId) return;
            pushUndoSnapshot();
            const displacedId = cells[toKey];
            cells[toKey] = movingId;
            if (displacedId) {
              cells[fromCellKey] = displacedId;
            } else {
              delete cells[fromCellKey];
            }
            hs.selectedSkillId = movingId;
            targetSlot = null;
            saveState();
            renderAll();
            showToast(displacedId ? "⇄ Swapped skill tree slots" : "↗ Moved skill node");
          } else if (paletteSkillId && ALL_SKILLS.has(paletteSkillId)) {
            slotSkillIntoActiveHero(paletteSkillId, {
              treeIdx: def.treeIdx,
              tier: toTier,
              col: toCol,
            });
          }
        });
      });
    }

    renderMobileTreeActionDock();
    requestAnimationFrame(() => drawTreePrereqArrows(def, hs));
  }

  function drawTreePrereqArrows(def, hs) {
    const svg = document.getElementById("treeConnectorSvg");
    const board = document.getElementById("d2TreeBoard");
    if (!svg || !board) return;
    const bRect = board.getBoundingClientRect();
    if (!bRect.width) return;

    svg.setAttribute("viewBox", `0 0 ${bRect.width} ${bRect.height}`);

    const posBySkill = {};
    board.querySelectorAll("[data-skill-node]").forEach((cell) => {
      const sid = cell.dataset.skillNode;
      const node = cell.querySelector(".skill-icon-box") || cell;
      const r = node.getBoundingClientRect();
      posBySkill[sid] = {
        cx: r.left - bRect.left + r.width / 2,
        top: r.top - bRect.top - 4,
        bottom: r.bottom - bRect.top + 38,
      };
    });

    let paths = `
      <defs>
        <marker id="goldArrowActive" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#ebc46c" />
        </marker>
        <marker id="stoneArrowIdle" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#766596" />
        </marker>
      </defs>
    `;

    const isBuilds = normalizeMode(state.activeMode) === "builds";
    Object.values(def.cells).forEach((sid) => {
      const prereqId = getEffectivePrereq(hs, def, sid);
      if (!prereqId || prereqId === sid || !posBySkill[prereqId] || !posBySkill[sid]) return;
      const from = posBySkill[prereqId];
      const to = posBySkill[sid];
      const active = isBuilds ? (hs.ranks[sid] || 0) > 0 && (hs.ranks[prereqId] || 0) > 0 : true;
      const stroke = active ? "#ebc46c" : "#685884";
      const marker = active ? "url(#goldArrowActive)" : "url(#stoneArrowIdle)";
      const midY = (from.bottom + to.top) / 2;
      paths += `<path d="M ${from.cx} ${from.bottom} C ${from.cx} ${midY}, ${to.cx} ${midY}, ${to.cx} ${to.top}"
        fill="none" stroke="${stroke}" stroke-width="${active ? 2.4 : 1.8}" marker-end="${marker}" opacity="${
        active ? 0.92 : 0.62
      }" />`;
    });

    svg.innerHTML = paths;
  }

  // ==========================================================================
  // 6. RIGHT INSPECTOR HEADER & ORIGINAL GAME ICON BREAKDOWN
  // ==========================================================================
  function findCellOfSkillInActiveTree(hero, hs, skillId) {
    const def = getActiveTreeDefinition(hero, hs);
    if (def.isUniversal) return null;
    const hit = Object.entries(def.cells).find(([, id]) => id === skillId);
    return hit ? { treeIdx: def.treeIdx, key: hit[0] } : null;
  }

  function locateSkillAcrossHeroTrees(hero, hs, skillId) {
    const meta = getHeroDisplayMeta(hero);
    for (let ti = 0; ti < 3; ti++) {
      const cells = (hs.treeGrid && hs.treeGrid[ti]) || {};
      const hit = Object.entries(cells).find(([, sid]) => sid === skillId);
      if (hit) {
        return {
          tabId: `tree${ti + 1}`,
          shortLabel: `Tree ${TIER_META[ti].roman}`,
          fullLabel: `Tree ${TIER_META[ti].roman}: ${(meta.trees[ti] && meta.trees[ti].name) || `Tree ${ti + 1}`}`,
          cellKey: hit[0],
          inHeroTrees: true,
        };
      }
    }
    for (let ui = 0; ui < 2; ui++) {
      const ut = DATA.universalTrees[ui];
      if (ut && (ut.skills || []).some((s) => s.id === skillId)) {
        const nm = ui === 0 ? "Mobility" : "Warband";
        return {
          tabId: `tree${ui + 4}`,
          shortLabel: nm,
          fullLabel: `Universal: ${ut.name || nm}`,
          cellKey: "",
          inHeroTrees: true,
        };
      }
    }
    const fallbackIdx = getActiveClassTreeIndex(hs);
    const isUniv = hs.activeTab === "tree4" || hs.activeTab === "tree5";
    const activeTabId = hs.activeTab || "tree1";
    return {
      tabId: activeTabId,
      shortLabel: isUniv ? (activeTabId === "tree4" ? "Mobility" : "Warband") : `Tree ${TIER_META[fallbackIdx].roman}`,
      fullLabel: isUniv
        ? `Universal: ${activeTabId === "tree4" ? "Mobility" : "Warband"}`
        : `Tree ${TIER_META[fallbackIdx].roman}: ${(meta.trees[fallbackIdx] && meta.trees[fallbackIdx].name) || "Skill Tree"}`,
      cellKey: "",
      inHeroTrees: false,
    };
  }

  function getOrderedSkillsInTreeTab(hs, tabId) {
    if (tabId === "tree4" || tabId === "tree5") {
      const ut = DATA.universalTrees[tabId === "tree4" ? 0 : 1];
      return ((ut && ut.skills) || []).map((s) => s.id);
    }
    const ti = tabId === "tree2" ? 1 : tabId === "tree3" ? 2 : 0;
    const cells = (hs.treeGrid && hs.treeGrid[ti]) || {};
    const out = [];
    for (let t = 1; t <= 4; t++) {
      for (let c = 0; c < 3; c++) {
        const sid = cells[`${t}_${c}`];
        if (sid && !out.includes(sid)) out.push(sid);
      }
    }
    return out;
  }

  function jumpToHeroTreeAndHighlightSkill(tabId, skillId) {
    const hs = currentHeroState();
    if (tabId) hs.activeTab = tabId;
    if (skillId) hs.selectedSkillId = skillId;
    arenaReturnOrigin.desktopFromCodex = false;
    if (normalizeMode(state.activeMode) === "codex") {
      state.activeMode = "trees";
    }
    if (isMobileViewport()) {
      state.mobileTab = "tree";
    }
    saveState({ skipServer: true });
    renderAll();
    requestAnimationFrame(() => {
      drawTreePrereqArrows(getActiveTreeDefinition(currentHero(), hs), hs);
      const selNode = document.querySelector(`[data-select-skill="${CSS.escape(hs.selectedSkillId)}"]`);
      if (selNode && selNode.scrollIntoView) {
        selNode.scrollIntoView({ block: "nearest", behavior: "smooth" });
        selNode.classList.add("return-pulse-highlight");
        setTimeout(() => selNode.classList.remove("return-pulse-highlight"), 1200);
      }
    });
  }

  function executeFastReturnFromArena() {
    const hero = currentHero();
    const hs = currentHeroState();
    const loc = locateSkillAcrossHeroTrees(hero, hs, hs.selectedSkillId);

    if (!isMobileViewport() && arenaReturnOrigin.desktopFromCodex) {
      arenaReturnOrigin.desktopFromCodex = false;
      codexState.tab = arenaReturnOrigin.codexTab || "skills";
      setActiveMode("codex");
      return;
    }

    if (isMobileViewport()) {
      const src = arenaReturnOrigin.mobileTab || "tree";
      if (src === "builds") {
        setMobileTab("builds");
        return;
      }
      if (src === "skills") {
        setMobileTab("skills");
        return;
      }
      if (src === "heroes") {
        setMobileTab("heroes");
        return;
      }
    }

    jumpToHeroTreeAndHighlightSkill(loc.tabId, hs.selectedSkillId);
  }

  function renderArenaBreadcrumbBar() {
    const bar = document.getElementById("arenaBreadcrumbBar");
    if (!bar) return;
    const hero = currentHero();
    const hs = currentHeroState();
    const meta = getHeroDisplayMeta(hero);
    const sk = getSkill(hs.selectedSkillId);
    const loc = locateSkillAcrossHeroTrees(hero, hs, sk.id);
    const isMob = isMobileViewport();
    const orderedIds = getOrderedSkillsInTreeTab(hs, loc.tabId);
    const curIdx = orderedIds.indexOf(sk.id);

    let backLabel = `← Back to ${loc.shortLabel}`;
    if (!isMob && arenaReturnOrigin.desktopFromCodex) {
      backLabel = "← Back to Skill Codex";
    } else if (isMob) {
      const src = arenaReturnOrigin.mobileTab || "tree";
      if (src === "builds") backLabel = "← Back to Builds";
      else if (src === "skills") backLabel = "← Back to Skills";
      else backLabel = `← Back to ${loc.shortLabel}`;
    }

    const showSecondaryTreeBtn =
      (isMob && (arenaReturnOrigin.mobileTab === "builds" || arenaReturnOrigin.mobileTab === "skills")) ||
      (!isMob && arenaReturnOrigin.desktopFromCodex);

    const quickBackBtn = document.getElementById("btnVizQuickBack");
    if (quickBackBtn) {
      const shouldShowQuickBack = isMob || arenaReturnOrigin.desktopFromCodex;
      quickBackBtn.classList.toggle("hidden", !shouldShowQuickBack);
      quickBackBtn.textContent =
        !isMob && arenaReturnOrigin.desktopFromCodex
          ? "← Codex"
          : arenaReturnOrigin.mobileTab === "builds"
          ? "← Builds"
          : arenaReturnOrigin.mobileTab === "skills"
          ? "← Skills"
          : `← ${loc.shortLabel}`;
    }

    bar.innerHTML = `
      <div class="arena-bc-left">
        <button type="button" class="btn btn-xs btn-gold arena-bc-back-btn" id="btnArenaFastReturn">
          ${esc(backLabel)}
        </button>
        ${
          showSecondaryTreeBtn
            ? `<button type="button" class="btn btn-xs btn-outline arena-bc-tree-jump" id="btnArenaJumpTreeDirect" title="Open ${esc(loc.fullLabel)}">🌳 ${esc(loc.shortLabel)}</button>`
            : ""
        }
        <nav class="arena-bc-trail" aria-label="Skill Breadcrumb">
          <button type="button" class="bc-crumb" id="bcCrumbHero" title="Switch Hero">${esc(meta.name)}</button>
          <span class="bc-sep">›</span>
          <button type="button" class="bc-crumb bc-crumb-tree" id="bcCrumbTree" title="Jump to ${esc(loc.fullLabel)}">${esc(
      sk.isWeaponGranted ? "Weapon Loadout" : loc.fullLabel
    )}</button>
          <span class="bc-sep">›</span>
          <span class="bc-crumb-current">${esc(sk.name)}</span>
        </nav>
      </div>
      ${
        orderedIds.length > 1
          ? `
        <div class="arena-bc-stepper" title="Cycle skills in ${esc(loc.shortLabel)} without leaving Arena">
          <button type="button" class="bc-step-btn" id="btnBcPrevSkill" aria-label="Previous skill in tree">‹</button>
          <span class="bc-step-pos">${curIdx >= 0 ? `${curIdx + 1}/${orderedIds.length}` : `${orderedIds.length} nodes`}</span>
          <button type="button" class="bc-step-btn" id="btnBcNextSkill" aria-label="Next skill in tree">›</button>
        </div>
      `
          : ""
      }
    `;

    const fastBtn = document.getElementById("btnArenaFastReturn");
    if (fastBtn) fastBtn.addEventListener("click", executeFastReturnFromArena);

    const treeDirectBtn = document.getElementById("btnArenaJumpTreeDirect");
    if (treeDirectBtn) {
      treeDirectBtn.addEventListener("click", () => jumpToHeroTreeAndHighlightSkill(loc.tabId, sk.id));
    }

    const crumbHero = document.getElementById("bcCrumbHero");
    if (crumbHero) {
      crumbHero.addEventListener("click", () => {
        if (isMobileViewport()) setMobileTab("heroes");
        else {
          const heroBar = document.getElementById("heroSelectStage");
          if (heroBar && heroBar.scrollIntoView) heroBar.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }

    const crumbTree = document.getElementById("bcCrumbTree");
    if (crumbTree) {
      crumbTree.addEventListener("click", () => {
        if (sk.isWeaponGranted) {
          setActiveMode("builds");
          if (isMobileViewport()) setMobileTab("builds");
        } else {
          jumpToHeroTreeAndHighlightSkill(loc.tabId, sk.id);
        }
      });
    }

    const cycleSkill = (dir) => {
      if (!orderedIds.length) return;
      const base = curIdx >= 0 ? curIdx : 0;
      const nextIdx = (base + dir + orderedIds.length) % orderedIds.length;
      const nextSid = orderedIds[nextIdx];
      hs.selectedSkillId = nextSid;
      hs.activeTab = loc.tabId;
      saveState({ skipServer: true });
      renderSkillTree();
      renderSkillBreakdown();
      if (normalizeMode(state.activeMode) === "builds") renderBuildComboStage();
      triggerSkillPreview(nextSid, true);
    };
    const prevBtn = document.getElementById("btnBcPrevSkill");
    if (prevBtn) prevBtn.addEventListener("click", () => cycleSkill(-1));
    const nextBtn = document.getElementById("btnBcNextSkill");
    if (nextBtn) nextBtn.addEventListener("click", () => cycleSkill(1));
  }

  function renderSkillBreakdown() {
    const hero = currentHero();
    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const isBuilds = normalizeMode(state.activeMode) === "builds";
    const sk = getSkill(hs.selectedSkillId);
    const rk = hs.ranks[sk.id] || 0;
    const iconSrc = sk.icon || "assets/icons/d2r/ama_jab.png";
    const activeCell = findCellOfSkillInActiveTree(hero, hs, sk.id);
    const isCustomEdited = Boolean(state.customSkills && state.customSkills[sk.id]);
    const inCombo = (activeBuild.rotation || []).some((r) => r && r.skillId === sk.id);

    const activeMod = getActiveSkillModifierForBuild(sk.id, activeBuild);
    const compatMods = getCompatibleModifiersForSkill(sk);
    const curWmb = activeBuild.weaponMiniBuildId ? getWeaponMiniBuild(activeBuild.weaponMiniBuildId) : null;
    const curArch = getWeaponArchetype(activeBuild.weaponArchetypeId);

    renderArenaBreadcrumbBar();

    const headerEl = document.getElementById("previewSkillHeader");
    headerEl.innerHTML = `
      <div class="preview-title-row">
        <div class="preview-big-icon">
          <img src="${esc(iconSrc)}" alt="${esc(sk.name)}" />
        </div>
        <div>
          <h3 class="preview-skill-name">${esc(sk.name)}${activeMod ? ` <span class="active-mod-title-chip">⚡ ${esc(activeMod.name.split("(")[0].trim())}</span>` : ""}</h3>
          <div class="preview-meta-pills">
            <span class="meta-pill gold">${sk.isWeaponGranted ? "🗡️ Weapon Skill" : `Tier ${TIER_META[Math.min(3, Math.max(0, (sk.tier || 1) - 1))].roman}${isBuilds ? ` · Rank ${rk}/${sk.maxRank || 20}` : ""}`}</span>
            <span class="meta-pill cyan">${esc(sk.castType || "Active")}</span>
            ${sk.cooldown ? `<span class="meta-pill">⏱ ${esc(sk.cooldown)}</span>` : ""}
            ${sk.resource ? `<span class="meta-pill emerald">⚡ ${esc(sk.resource)}</span>` : ""}
            ${isCustomEdited ? `<span class="meta-pill gold">✨ Custom / Edited</span>` : ""}
          </div>
        </div>
      </div>
      <div class="preview-header-actions">
        ${
          sk.isWeaponGranted
            ? `
              <button type="button" class="btn btn-xs ${inCombo ? "btn-gold" : "btn-emerald"}" id="btnHeaderComboToggle">${inCombo ? "★ In Combo" : "＋ Add to Combo"}</button>
            `
            : isBuilds
            ? `
              <button type="button" class="btn btn-xs ${inCombo ? "btn-gold" : "btn-emerald"}" id="btnHeaderComboToggle">${inCombo ? "★ In Combo" : "＋ Add to Combo"}</button>
              <button type="button" class="btn btn-xs btn-outline" id="btnHeaderEditNode">✏️ Edit Skill</button>
            `
            : `
              <button type="button" class="btn btn-xs btn-gold" id="btnHeaderEditNode">✏️ Edit Node</button>
              <button type="button" class="btn btn-xs btn-emerald" id="btnHeaderForkNode" title="Fork an independent custom copy of this skill">📋 Fork Copy</button>
              <button type="button" class="btn btn-xs btn-outline" id="btnHeaderReplaceOrSlot">
                ${activeCell ? "⇄ Replace Slot" : "＋ Slot in Tree"}
              </button>
            `
        }
      </div>
    `;

    const comboToggleBtn = document.getElementById("btnHeaderComboToggle");
    if (comboToggleBtn) {
      comboToggleBtn.addEventListener("click", () => toggleSkillInActiveBuildRotation(sk.id));
    }

    const editBtn = document.getElementById("btnHeaderEditNode");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        if (activeCell) openNodeEditorForCell(activeCell.treeIdx, activeCell.key);
        else openNodeEditorForSkill(sk.id);
      });
    }

    const forkBtn = document.getElementById("btnHeaderForkNode");
    if (forkBtn) {
      forkBtn.addEventListener("click", () => {
        if (activeCell) openNodeEditorForCell(activeCell.treeIdx, activeCell.key);
        else openNodeEditorForSkill(sk.id);
      });
    }

    const repBtn = document.getElementById("btnHeaderReplaceOrSlot");
    if (repBtn) {
      repBtn.addEventListener("click", () => {
        if (activeCell) {
          const [tStr, cStr] = activeCell.key.split("_");
          setTargetSlot({
            treeIdx: activeCell.treeIdx,
            tier: parseInt(tStr, 10),
            col: parseInt(cStr, 10),
          });
          const pSearch = document.getElementById("paletteSearchInput");
          if (pSearch) pSearch.focus();
        } else {
          slotSkillIntoActiveHero(sk.id);
        }
      });
    }

    const refIcons =
      sk.refIcons && sk.refIcons.length
        ? sk.refIcons
        : [{ game: shortOriginTag(sk), skillName: sk.origGameSkillName || sk.similarTo || sk.name, icon: iconSrc }];

    const buildReadoutHtml = isBuilds
      ? `
      <div class="build-playstyle-readout">
        <h4>⚔️ ${esc(activeBuild.name)} — How This Build Plays${curWmb ? ` (🗡️ ${esc(curWmb.name)})` : curArch ? ` (⚔️ ${esc(curArch.name)})` : activeBuild.weapons ? ` (${esc(activeBuild.weapons)})` : ""}</h4>
        <p>${esc(activeBuild.loopNotes || "Invest up to 110 points across your trees and chain skills in the Gameplay Rotation above to preview the playstyle live.")}</p>
        ${
          activeBuild.synergyNotes
            ? `<p style="margin-top:5px;color:#9df0cc;"><strong>Mobility &amp; Warband Synergy:</strong> ${esc(activeBuild.synergyNotes)}</p>`
            : ""
        }
      </div>
      `
      : "";

    let mutatorPanelHtml = "";
    if (!compatMods.isPassive && compatMods.curated.length > 0) {
      const displayMods = showAllModsInInspector ? compatMods.all : compatMods.curated;
      mutatorPanelHtml = `
        <div class="skill-mutator-panel">
          <div class="mutator-panel-head">
            <div>
              <div class="section-kicker" style="margin-bottom:2px;">⚡ SKILL BEHAVIOR MUTATOR SOCKET (RANK 4 UNLOCK · PICK 1)</div>
              <div class="mutator-sub">Transforms geometry, cadence, or crowd-control with a zero-sum balance trade-off — click any choice to test live in the arena!</div>
            </div>
            <div class="mutator-head-btns">
              ${
                activeMod
                  ? `<button type="button" class="btn btn-xs btn-outline" id="btnClearSkillMutator">↺ Base Skill</button>`
                  : ""
              }
              <button type="button" class="btn btn-xs btn-outline" id="btnToggleAllMutators">
                ${showAllModsInInspector ? `Show Top 3 Curated` : `Browse All ${compatMods.all.length}`}
              </button>
            </div>
          </div>
          <div class="mutator-choice-grid">
            ${displayMods
              .map((m, idx) => {
                const isSel = activeMod && activeMod.id === m.id;
                const slotLetter = idx < 3 && !showAllModsInInspector ? `Choice ${String.fromCharCode(65 + idx)}` : m.category;
                return `
                  <div class="mutator-choice-card ${isSel ? "active" : ""}" data-socket-mod="${esc(m.id)}">
                    <div class="mutator-card-top">
                      <span class="mutator-slot-tag">${esc(slotLetter)}</span>
                      <span class="mutator-cat-pill">${esc(m.category)}</span>
                    </div>
                    <div class="mutator-card-name">${isSel ? "⚡ " : ""}${esc(m.name)}</div>
                    <div class="mutator-card-beh">${esc(m.behaviorChange)}</div>
                    <div class="mutator-card-trade"><strong>Trade-Off:</strong> ${esc(m.tradeoff)}</div>
                    <div class="mutator-card-insp">≈ ${esc(m.sourceInspiration)}</div>
                  </div>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
    }

    const liveSim = evalActiveHeroCombat();
    const pvpSim = evalActiveHeroCombat({ targetTier: "pvp_duel" });
    const combatStripHtml = `
      <div class="skill-combat-strip">
        <div class="scs-head">
          <div class="scs-title">⚖️ Grounded Blood Crown Combat Numbers — Lvl ${liveSim.level} · ${esc(liveSim.gearTier.toUpperCase())} Gear · vs ${esc(liveSim.targetLabel)}</div>
          <button type="button" class="btn btn-xs btn-outline" id="btnInspectInMatrix">⚖️ Open in Game Matrix →</button>
        </div>
        <div class="act-metrics-grid">
          <div class="act-metric">
            <span class="act-metric-k">Hit Damage</span>
            <span class="act-metric-v gold">${Math.round(liveSim.finalHitDamage)} (${liveSim.hitChancePct}% Hit)</span>
          </div>
          <div class="act-metric">
            <span class="act-metric-k">Single HTK / TTK</span>
            <span class="act-metric-v ${liveSim.inTargetBox ? "emerald" : "crimson"}">${liveSim.hitsToKill} hits · ${liveSim.secondsToKill}s</span>
          </div>
          <div class="act-metric">
            <span class="act-metric-k">5-Mob Pack Clear</span>
            <span class="act-metric-v cyan">${liveSim.packSwingsToClear5} swings · ${liveSim.packSecondsToClear5}s</span>
          </div>
          <div class="act-metric">
            <span class="act-metric-k">Poise Impact</span>
            <span class="act-metric-v ${liveSim.triggersPoiseFlinch ? "gold" : ""}">${liveSim.poiseHitPctMaxHp}% HP ${liveSim.triggersPoiseFlinch ? "⚡ Flinch" : "(Chip)"}</span>
          </div>
          <div class="act-metric">
            <span class="act-metric-k">Equal-Gear PvP</span>
            <span class="act-metric-v emerald">${pvpSim.hitsToKill} hits · ${pvpSim.secondsToKill}s</span>
          </div>
        </div>
      </div>
    `;

    const breakdownEl = document.getElementById("deepSkillBreakdown");
    breakdownEl.innerHTML = `
      ${buildReadoutHtml}
      ${combatStripHtml}
      ${mutatorPanelHtml}
      <div class="orig-refs-box">
        <div class="section-kicker">🎮 ORIGINAL GAME SKILL REFERENCE &amp; ICON${refIcons.length > 1 ? "S" : ""}</div>
        <div class="orig-ref-cards">
          ${refIcons
            .map(
              (ri) => `
            <div class="orig-ref-card">
              <img src="${esc(ri.icon || iconSrc)}" alt="${esc(ri.skillName)}" />
              <div>
                <div class="orig-ref-game">${esc(ri.game)}</div>
                <div class="orig-ref-name">${esc(ri.skillName)}</div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="orig-how-text">
          <strong>How the Original Skill Worked (${esc(sk.origGameSkillName || sk.similarTo || "ARPG Reference")}):</strong>
          ${esc(sk.origHowItWorked || sk.mechanic)}
        </div>
      </div>

      <div class="mechanics-two-col">
        <div class="mech-card">
          <h4>⚔️ How It Works in Blood Crown</h4>
          <p>${esc(sk.bcExactInteraction || sk.mechanic)}</p>
        </div>
        <div class="mech-card">
          <h4>🔗 Tactical Cue &amp; Tree Synergy</h4>
          <p>${esc(
            sk.hybridHook ||
              sk.staminaRule ||
              "Combos cleanly with crowd-control slows, pulls, and formation abilities in your other trees."
          )}</p>
        </div>
      </div>
    `;

    const inspectMatrixBtn = document.getElementById("btnInspectInMatrix");
    if (inspectMatrixBtn) {
      inspectMatrixBtn.addEventListener("click", () => {
        if (isMobileViewport()) setMobileTab("matrix");
        else setActiveMode("matrix");
      });
    }
    const clearModBtn = document.getElementById("btnClearSkillMutator");
    if (clearModBtn) {
      clearModBtn.addEventListener("click", () => setSkillModifierOnActiveBuild(sk.id, ""));
    }
    const toggleAllModsBtn = document.getElementById("btnToggleAllMutators");
    if (toggleAllModsBtn) {
      toggleAllModsBtn.addEventListener("click", () => {
        showAllModsInInspector = !showAllModsInInspector;
        renderSkillBreakdown();
      });
    }
    breakdownEl.querySelectorAll("[data-socket-mod]").forEach((card) => {
      card.addEventListener("click", () => {
        setSkillModifierOnActiveBuild(sk.id, card.dataset.socketMod);
      });
    });
    renderArenaCombatTelemetry();
  }

  function evalActiveHeroCombat(overrideOpts) {
    const hs = currentHeroState();
    const build = currentActiveBuild();
    const sk = getSkill(hs.selectedSkillId);
    const wmb = build.weaponMiniBuildId ? getWeaponMiniBuild(build.weaponMiniBuildId) : null;
    const weaponId = (wmb && wmb.baseArchetypeId) || build.weaponArchetypeId || inferWeaponArchetypeForText(build.weapons, currentHero().id);
    const activeMod = getActiveSkillModifierForBuild(sk.id, build);
    const rk = Math.max(1, Number((build.ranks && build.ranks[sk.id]) || (hs.ranks && hs.ranks[sk.id]) || 4));
    const skillMult = matrixState.useBuildSkillRank ? 1.0 + Math.min(20, rk) * 0.012 : 1.05;
    return evalBcCombat({
      level: matrixState.level,
      gearTier: matrixState.gearTier,
      targetTier: matrixState.targetTier,
      weaponId,
      modifierId: activeMod ? activeMod.id : "none",
      skillDamageMult: skillMult,
      wmb,
      ...(overrideOpts || {}),
    });
  }

  // ==========================================================================
  // 7. FULL-SCREEN QUICK SKILL, MODIFIER & WEAPON CODEX WORKSPACE
  // ==========================================================================
  function renderCodexWorkspace() {
    if (state.activeMode !== "codex") return;
    const heroMeta = getHeroDisplayMeta(currentHero());
    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const selSk = getSkill(hs.selectedSkillId);
    const lbl = document.getElementById("codexActiveHeroLabel");
    if (lbl) lbl.textContent = heroMeta.name;

    const cSearch = document.getElementById("codexSearchInput");
    if (cSearch && cSearch.value !== codexState.search) {
      cSearch.value = codexState.search;
    }

    const activeTab = codexState.tab || "skills";
    const tabSwitchHtml = `
      <button type="button" class="filter-pill codex-mode-pill ${activeTab === "skills" ? "active" : ""}" data-codex-tab="skills">📚 Skills (${ALL_SKILLS.size})</button>
      <button type="button" class="filter-pill codex-mode-pill ${activeTab === "modifiers" ? "active" : ""}" data-codex-tab="modifiers">⚡ Behavior Modifiers (${SKILL_MODIFIERS.length})</button>
      <button type="button" class="filter-pill codex-mode-pill ${activeTab === "weapons" ? "active" : ""}" data-codex-tab="weapons">⚔️ Weapons &amp; Mini-Builds (${WEAPON_ARCHETYPES.length + WEAPON_MINI_BUILDS.length})</button>
      <span class="v-sep"></span>
    `;

    const tagBar = document.getElementById("codexTagBar");
    const gameBar = document.getElementById("codexGameBar");
    const heroBar = document.getElementById("codexHeroBar");
    const grid = document.getElementById("codexGrid");
    if (!grid) return;

    if (activeTab === "modifiers") {
      const cats = ["ALL", ...Array.from(new Set(SKILL_MODIFIERS.map((m) => m.category)))];
      if (tagBar) {
        tagBar.innerHTML =
          tabSwitchHtml +
          cats
            .map(
              (c) =>
                `<button type="button" class="filter-pill ${codexState.modCategory === c ? "active" : ""}" data-cmodcat="${esc(c)}">${
                  c === "ALL" ? "All 6 Categories" : esc(c)
                }</button>`
            )
            .join("");
      }
      if (gameBar) gameBar.innerHTML = "";
      if (heroBar) heroBar.innerHTML = "";

      if (tagBar) {
        tagBar.querySelectorAll("[data-codex-tab]").forEach((b) =>
          b.addEventListener("click", () => {
            codexState.tab = b.dataset.codexTab;
            renderCodexWorkspace();
          })
        );
        tagBar.querySelectorAll("[data-cmodcat]").forEach((b) =>
          b.addEventListener("click", () => {
            codexState.modCategory = b.dataset.cmodcat;
            renderCodexWorkspace();
          })
        );
      }

      const q = (codexState.search || "").trim().toLowerCase();
      const modList = SKILL_MODIFIERS.filter((m) => {
        if (codexState.modCategory !== "ALL" && m.category !== codexState.modCategory) return false;
        if (!q) return true;
        const mTags = m.compatibleTags || m.appliesToTags || [];
        const hay = `${m.name} ${m.category} ${m.sourceInspiration} ${m.behaviorChange} ${m.tradeoff} ${mTags.join(" ")}`.toLowerCase();
        return hay.includes(q);
      });

      grid.innerHTML = modList.length
        ? modList
            .map((m) => {
              const activeOnSelected = activeBuild.skillModifiers && activeBuild.skillModifiers[selSk.id] === m.id;
              const mTags = m.compatibleTags || m.appliesToTags || [];
              return `
                <article class="codex-card">
                  <div class="codex-card-head">
                    <div class="codex-mod-emblem">⚡</div>
                    <div>
                      <div class="codex-card-title">${esc(m.name)}</div>
                      <div class="codex-card-origin">≈ ${esc(m.sourceInspiration)}</div>
                      <div class="preview-meta-pills">
                        <span class="meta-pill gold">${esc(m.category)}</span>
                        ${mTags
                          .slice(0, 3)
                          .map((t) => `<span class="meta-pill cyan">${esc(t)}</span>`)
                          .join("")}
                      </div>
                    </div>
                  </div>
                  <div class="codex-card-body"><strong>Behavior Mutation:</strong> ${esc(m.behaviorChange)}</div>
                  <div class="codex-orig-note">
                    <strong>Zero-Sum Trade-Off:</strong> ${esc(m.tradeoff)}<br/>
                    <strong>PvE / PvP:</strong> ${esc(m.pveRole)} · ${esc(m.pvpRole)}
                  </div>
                  <div class="codex-card-foot">
                    <button type="button" class="btn btn-xs btn-outline" data-mod-test="${esc(m.id)}">▶ Test on ${esc(selSk.name.split("(")[0].trim())}</button>
                    <button type="button" class="btn btn-xs ${activeOnSelected ? "btn-emerald" : "btn-gold"}" data-mod-socket="${esc(m.id)}">
                      ${activeOnSelected ? "⚡ Socketed" : `⚡ Socket on ${esc(selSk.name.split("(")[0].trim())}`}
                    </button>
                  </div>
                </article>
              `;
            })
            .join("")
        : `<div style="grid-column:1/-1;padding:36px;text-align:center;color:var(--text-dim);">No modifiers match your search.</div>`;

      grid.querySelectorAll("[data-mod-test]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mid = btn.dataset.modTest;
          arenaReturnOrigin.desktopFromCodex = true;
          arenaReturnOrigin.codexTab = "modifiers";
          setActiveMode("builds");
          triggerSkillPreview(selSk.id, true, mid);
          if (isMobileViewport()) setMobileTab("arena");
        });
      });
      grid.querySelectorAll("[data-mod-socket]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const mid = btn.dataset.modSocket;
          arenaReturnOrigin.desktopFromCodex = true;
          arenaReturnOrigin.codexTab = "modifiers";
          state.activeMode = "builds";
          syncWorkspaceLayout();
          setSkillModifierOnActiveBuild(selSk.id, mid);
          if (isMobileViewport()) setMobileTab("arena");
        });
      });
      return;
    }

    if (activeTab === "weapons") {
      if (tagBar) tagBar.innerHTML = tabSwitchHtml;
      if (gameBar) gameBar.innerHTML = "";
      if (heroBar) heroBar.innerHTML = "";

      if (tagBar) {
        tagBar.querySelectorAll("[data-codex-tab]").forEach((b) =>
          b.addEventListener("click", () => {
            codexState.tab = b.dataset.codexTab;
            renderCodexWorkspace();
          })
        );
      }

      const q = (codexState.search || "").trim().toLowerCase();
      const miniCards = WEAPON_MINI_BUILDS.filter((wm) => {
        if (!q) return true;
        return `${wm.name} ${wm.tier} ${wm.d2Inspiration} ${wm.grantedSkill && wm.grantedSkill.name} ${wm.grantedSkill && wm.grantedSkill.baseBehavior}`.toLowerCase().includes(q);
      }).map((wm) => {
        const isEq = activeBuild.weaponMiniBuildId === wm.id;
        return `
          <article class="codex-card">
            <div class="codex-card-head">
              <div class="codex-mod-emblem">🗡️</div>
              <div>
                <div class="codex-card-title">${esc(wm.name)}</div>
                <div class="codex-card-origin">≈ ${esc(wm.d2Inspiration)}</div>
                <div class="preview-meta-pills">
                  <span class="meta-pill gold">${esc(wm.tier)}</span>
                  <span class="meta-pill emerald">Grants: ${esc(wm.grantedSkill ? wm.grantedSkill.name : "")}</span>
                </div>
              </div>
            </div>
            <div class="codex-card-body">${esc(wm.grantedSkill ? wm.grantedSkill.baseBehavior : "")}</div>
            <div class="codex-orig-note">
              <strong>3 Built-In Mutator Paths:</strong>
              ${((wm.grantedSkill && wm.grantedSkill.modifierChoices) || []).map((c) => esc(c.label)).join(" · ")}
            </div>
            <div class="codex-card-foot">
              <span class="muted-sub">Weapon Mini-Build</span>
              <button type="button" class="btn btn-xs ${isEq ? "btn-emerald" : "btn-gold"}" data-equip-wmb="${esc(wm.id)}">
                ${isEq ? "✓ Equipped on Build" : `🗡️ Equip on ${esc(activeBuild.name)}`}
              </button>
            </div>
          </article>
        `;
      });

      const archCards = WEAPON_ARCHETYPES.filter((wa) => {
        if (!q) return true;
        return `${wa.name} ${wa.hands} ${wa.d2Roots} ${wa.intrinsicTrait} ${wa.attackCadence}`.toLowerCase().includes(q);
      }).map((wa) => {
        const isEq = activeBuild.weaponArchetypeId === wa.id;
        return `
          <article class="codex-card">
            <div class="codex-card-head">
              <div class="codex-mod-emblem">⚔️</div>
              <div>
                <div class="codex-card-title">${esc(wa.name)}</div>
                <div class="codex-card-origin">D2 Roots: ${esc(wa.d2Roots)}</div>
                <div class="preview-meta-pills">
                  <span class="meta-pill gold">${esc(wa.hands)}</span>
                  <span class="meta-pill cyan">${esc(wa.reachBand)}</span>
                </div>
              </div>
            </div>
            <div class="codex-card-body"><strong>Intrinsic Trait:</strong> ${esc(wa.intrinsicTrait)}</div>
            <div class="codex-orig-note">
              <strong>Cadence &amp; Trade-Off:</strong> ${esc(wa.attackCadence)} — ${esc(wa.tradeoff)}
            </div>
            <div class="codex-card-foot">
              <span class="muted-sub">${esc((wa.primaryClasses || []).join(", "))}</span>
              <button type="button" class="btn btn-xs ${isEq ? "btn-emerald" : "btn-outline"}" data-equip-warch="${esc(wa.id)}">
                ${isEq ? "✓ Active Family" : `Equip Archetype`}
              </button>
            </div>
          </article>
        `;
      });

      const combined = [...miniCards, ...archCards];
      grid.innerHTML = combined.length
        ? combined.join("")
        : `<div style="grid-column:1/-1;padding:36px;text-align:center;color:var(--text-dim);">No weapons match your search.</div>`;

      grid.querySelectorAll("[data-equip-wmb]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeMode = "builds";
          syncWorkspaceLayout();
          setWeaponMiniBuildOnActiveBuild(btn.dataset.equipWmb);
          if (isMobileViewport()) setMobileTab("arena");
        });
      });
      grid.querySelectorAll("[data-equip-warch]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.activeMode = "builds";
          syncWorkspaceLayout();
          setWeaponArchetypeOnActiveBuild(btn.dataset.equipWarch);
          if (isMobileViewport()) setMobileTab("builds");
        });
      });
      return;
    }

    if (tagBar) {
      tagBar.innerHTML =
        tabSwitchHtml +
        TAG_FILTERS.map(
          (t) =>
            `<button type="button" class="filter-pill ${codexState.tag === t ? "active" : ""}" data-ctag="${esc(t)}">${
              t === "All" ? "All Mechanics" : esc(t)
            }</button>`
        ).join("");
      tagBar.querySelectorAll("[data-codex-tab]").forEach((b) => {
        b.addEventListener("click", () => {
          codexState.tab = b.dataset.codexTab;
          renderCodexWorkspace();
        });
      });
      tagBar.querySelectorAll("[data-ctag]").forEach((b) => {
        b.addEventListener("click", () => {
          codexState.tag = b.dataset.ctag;
          renderCodexWorkspace();
        });
      });
    }

    if (gameBar) {
      gameBar.innerHTML = SOURCE_GAMES.map(
        (g) =>
          `<button type="button" class="filter-pill ${codexState.game === g ? "active" : ""}" data-cgame="${esc(g)}">${
            g === "ALL" ? "All Source Games" : esc(g)
          }</button>`
      ).join("");
      gameBar.querySelectorAll("[data-cgame]").forEach((b) => {
        b.addEventListener("click", () => {
          codexState.game = b.dataset.cgame;
          renderCodexWorkspace();
        });
      });
    }

    const heroNames = ["ALL", ...DATA.heroes.map((h) => h.name), "Universal", "Custom"];
    if (heroBar) {
      heroBar.innerHTML = heroNames
        .map(
          (hn) =>
            `<button type="button" class="filter-pill ${codexState.hero === hn ? "active" : ""}" data-chero="${esc(
              hn
            )}">${hn === "ALL" ? "All Heroes" : esc(hn)}</button>`
        )
        .join("");
      heroBar.querySelectorAll("[data-chero]").forEach((b) => {
        b.addEventListener("click", () => {
          codexState.hero = b.dataset.chero;
          renderCodexWorkspace();
        });
      });
    }

    const list = Array.from(ALL_SKILLS.values()).filter((sk) => skillMatchesFilters(sk, codexState));

    if (!list.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;padding:36px;text-align:center;color:var(--text-dim);">No skills match your Codex search. Try clearing a filter pill or author a brand-new skill!</div>`;
      return;
    }

    grid.innerHTML = list
      .map((sk) => {
        const iconSrc = sk.icon || "assets/icons/d2r/ama_jab.png";
        const effPills = (sk.effects || [])
          .slice(0, 3)
          .map((ef) => `<span class="meta-pill">${esc(ef)}</span>`)
          .join("");
        return `
          <article class="codex-card">
            <div class="codex-card-head">
              <img src="${esc(iconSrc)}" alt="${esc(sk.name)}" loading="lazy" />
              <div>
                <div class="codex-card-title">${esc(sk.name)}</div>
                <div class="codex-card-origin">≈ ${esc(sk.origGameSkillName || sk.similarTo || "Custom")} · (${esc(
          sk.originHero || "Custom"
        )})</div>
                <div class="preview-meta-pills">
                  <span class="meta-pill gold">Tier ${TIER_META[Math.min(3, Math.max(0, (sk.tier || 1) - 1))].roman}</span>
                  <span class="meta-pill cyan">${esc(sk.castType || "Active")}</span>
                  ${sk.cooldown ? `<span class="meta-pill">⏱ ${esc(sk.cooldown)}</span>` : ""}
                  ${effPills}
                </div>
              </div>
            </div>
            <div class="codex-card-body">${esc(sk.bcExactInteraction || sk.mechanic)}</div>
            <div class="codex-orig-note">
              <strong>${esc(shortOriginTag(sk))} Reference:</strong> ${esc(sk.origHowItWorked || sk.mechanic)}
            </div>
            <div class="codex-card-foot">
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                <button type="button" class="btn btn-xs btn-outline" data-codex-preview="${esc(sk.id)}">▶ Preview Live</button>
                <button type="button" class="btn btn-xs btn-outline" data-codex-edit="${esc(sk.id)}">✏️ Edit</button>
              </div>
              <button type="button" class="btn btn-xs btn-gold" data-codex-slot="${esc(sk.id)}">＋ Add to ${esc(
          heroMeta.name
        )}</button>
            </div>
          </article>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-codex-preview]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const sid = btn.dataset.codexPreview;
        currentHeroState().selectedSkillId = sid;
        arenaReturnOrigin.desktopFromCodex = true;
        arenaReturnOrigin.codexTab = "skills";
        setActiveMode("trees");
        triggerSkillPreview(sid, true);
      });
    });

    grid.querySelectorAll("[data-codex-edit]").forEach((btn) => {
      btn.addEventListener("click", () => {
        openNodeEditorForSkill(btn.dataset.codexEdit);
      });
    });

    grid.querySelectorAll("[data-codex-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.activeMode = "trees";
        syncWorkspaceLayout();
        slotSkillIntoActiveHero(btn.dataset.codexSlot);
      });
    });
  }


  // ==========================================================================
  // 4. BESPOKE 60FPS ISOMETRIC SKILL CHOREOGRAPHY ENGINE (ALL 138 SKILLS!)
  // ==========================================================================
  const canvas = document.getElementById("isoArenaCanvas");
  const ctx = canvas.getContext("2d");

  const arena = {
    hero: { x: -3.2, y: 0.2, baseX: -3.2, baseY: 0.2, morph: null, morphTimer: 0, aura: null, auraTimer: 0 },
    aim: { x: 1.6, y: -0.1 },
    walls: [{ x: 3.5, y: -0.2, r: 0.62, permanent: true, kind: "stone", ttl: 999 }],
    corpses: [],
    enemies: [],
    allies: [],
    projectiles: [],
    zones: [],
    beams: [],
    slashes: [],
    turrets: [],
    floaters: [],
    autoTimer: 0.4,
    comboQueue: [],
    comboTimer: 0,
    comboSequenceIds: [],
    activeComboSkillId: null,
    activeComboIndex: -1,
  };

  function isoProject(wx, wy) {
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.54;
    const tw = 46;
    const th = 23;
    return {
      x: cx + (wx - wy) * tw,
      y: cy + (wx + wy) * th,
    };
  }

  function screenToIso(sx, sy) {
    const cx = canvas.width * 0.5;
    const cy = canvas.height * 0.54;
    const dx = (sx - cx) / 46;
    const dy = (sy - cy) / 23;
    return {
      x: Math.max(-5.2, Math.min(5.2, (dy + dx) * 0.5)),
      y: Math.max(-3.8, Math.min(3.8, (dy - dx) * 0.5)),
    };
  }

  function resetArenaDummies() {
    const lvl = matrixState.level || 30;
    const baseTier = ["trash", "standard", "brute", "pvp_duel"].includes(matrixState.targetTier)
      ? matrixState.targetTier
      : "standard";
    const packMob = bcMonsterStats(lvl, baseTier);
    const eliteMob = bcMonsterStats(lvl, matrixState.targetTier === "boss" ? "boss" : "elite");

    arena.hero.x = -3.2;
    arena.hero.y = 0.2;
    arena.hero.morph = null;
    arena.hero.aura = null;
    arena.kills = 0;
    arena.poiseTriggers = 0;
    arena.lastHitDmg = 0;
    arena.walls = [{ x: 3.5, y: -0.2, r: 0.62, permanent: true, kind: "stone", ttl: 999 }];
    arena.projectiles = [];
    arena.zones = [];
    arena.beams = [];
    arena.slashes = [];
    arena.turrets = [];
    arena.allies = [];
    arena.floaters = [];
    arena.corpses = [
      { x: 1.0, y: 0.7, popped: false },
      { x: 1.9, y: -0.8, popped: false },
      { x: 2.3, y: 0.5, popped: false },
    ];
    const packLabel = baseTier === "pvp_duel" ? "PvP Rival" : baseTier === "trash" ? "Swarm" : baseTier === "brute" ? "Brute" : "Trooper";
    arena.enemies = [
      { id: 1, name: `Vanguard (${packLabel})`, elite: false, armorDrPct: packMob.armorDrPct, x: 0.7, y: -1.1, bx: 0.7, by: -1.1, hp: packMob.hp, maxHp: packMob.hp, status: "", statusTtl: 0, flinchTtl: 0, poiseImmuneTtl: 0, respawnTtl: 0, color: baseTier === "pvp_duel" ? "#b77cff" : "#d95b5b" },
      { id: 2, name: `Raider (${packLabel})`, elite: false, armorDrPct: packMob.armorDrPct, x: 1.1, y: 0.2, bx: 1.1, by: 0.2, hp: packMob.hp, maxHp: packMob.hp, status: "", statusTtl: 0, flinchTtl: 0, poiseImmuneTtl: 0, respawnTtl: 0, color: baseTier === "pvp_duel" ? "#b77cff" : "#d95b5b" },
      { id: 3, name: `Skirmisher (${packLabel})`, elite: false, armorDrPct: packMob.armorDrPct, x: 1.4, y: 1.3, bx: 1.4, by: 1.3, hp: packMob.hp, maxHp: packMob.hp, status: "", statusTtl: 0, flinchTtl: 0, poiseImmuneTtl: 0, respawnTtl: 0, color: baseTier === "pvp_duel" ? "#b77cff" : "#d95b5b" },
      { id: 4, name: matrixState.targetTier === "boss" ? "Act Boss" : "Dread Captain", elite: true, armorDrPct: eliteMob.armorDrPct, x: 2.2, y: -0.2, bx: 2.2, by: -0.2, hp: eliteMob.hp, maxHp: eliteMob.hp, status: "", statusTtl: 0, flinchTtl: 0, poiseImmuneTtl: 0, respawnTtl: 0, color: "#f2b84b" },
      { id: 5, name: `Arbalest (${packLabel})`, elite: false, armorDrPct: packMob.armorDrPct, x: 2.8, y: -1.3, bx: 2.8, by: -1.3, hp: packMob.hp, maxHp: packMob.hp, status: "", statusTtl: 0, flinchTtl: 0, poiseImmuneTtl: 0, respawnTtl: 0, color: baseTier === "pvp_duel" ? "#b77cff" : "#d95b5b" },
      { id: 6, name: `Flanker (${packLabel})`, elite: false, armorDrPct: packMob.armorDrPct, x: 2.7, y: 1.0, bx: 2.7, by: 1.0, hp: packMob.hp, maxHp: packMob.hp, status: "", statusTtl: 0, flinchTtl: 0, poiseImmuneTtl: 0, respawnTtl: 0, color: baseTier === "pvp_duel" ? "#b77cff" : "#d95b5b" },
    ];
    renderArenaCombatTelemetry();
  }

  function addFloater(wx, wy, text, color) {
    arena.floaters.push({ x: wx, y: wy, text, color: color || "#ffe49c", age: 0, life: 1.15 });
  }

  function hitEnemy(en, dmg, statusText, color, isDirectGroundedDmg) {
    if (!en || en.respawnTtl > 0) return;
    const sim = evalActiveHeroCombat({ targetTier: en.elite ? (matrixState.targetTier === "boss" ? "boss" : "elite") : matrixState.targetTier });
    const actualDmg = isDirectGroundedDmg
      ? Math.max(1, Math.round(dmg))
      : Math.max(1, Math.round(sim.finalHitDamage * (Math.max(2, Number(dmg || 20)) / 20.0)));
    arena.lastHitDmg = actualDmg;

    const rules = bcCombatRulesCfg();
    const wSim = (GAME_MATRIX.weaponSimRules && GAME_MATRIX.weaponSimRules[sim.weaponId]) || { poiseBonusMult: 1.0 };
    const pctHp = ((actualDmg * Number(wSim.poiseBonusMult || 1.0)) / Math.max(1, en.maxHp)) * 100.0;
    let triggeredPoise = false;
    if (pctHp >= Number(rules.poiseFlinchMaxHpPct || 12.0) && (en.poiseImmuneTtl || 0) <= 0) {
      triggeredPoise = true;
      en.flinchTtl = 0.28;
      en.poiseImmuneTtl = 1.2;
      en.x = Math.min(4.6, en.x + 0.22);
      arena.poiseTriggers = (arena.poiseTriggers || 0) + 1;
    }

    en.hp = Math.max(0, en.hp - actualDmg);
    if (en.hp <= 0) {
      en.respawnTtl = 1.35;
      en.status = "";
      en.statusTtl = 0;
      arena.kills = (arena.kills || 0) + 1;
      if (arena.corpses.length < 7) {
        arena.corpses.push({ x: en.x, y: en.y, popped: false });
      }
      addFloater(en.x, en.y - 0.3, `💀 -${actualDmg} SLAYED!`, "#ffe082");
      renderArenaCombatTelemetry();
      return;
    }

    if (triggeredPoise) {
      en.status = "⚡ POISE STAGGER!";
      en.statusTtl = 1.05;
    } else if (statusText) {
      en.status = statusText;
      en.statusTtl = 1.45;
    }
    const tag = triggeredPoise ? `-${actualDmg} ⚡` : statusText ? `-${actualDmg} · ${statusText}` : `-${actualDmg}`;
    addFloater(en.x, en.y - 0.25, tag, triggeredPoise ? "#ffe07d" : color || "#ffe49c");
  }

  function castWeaponAutoSwing() {
    const sim = evalActiveHeroCombat({ modifierId: "none", skillDamageMult: 1.0 });
    const wArch = getWeaponArchetype(sim.weaponId);
    const liveEnemies = arena.enemies
      .filter((e) => !e.respawnTtl || e.respawnTtl <= 0)
      .sort((a, b) => Math.hypot(a.x - arena.hero.x, a.y - arena.hero.y) - Math.hypot(b.x - arena.hero.x, b.y - arena.hero.y));

    arena.autoTimer = 2.8;
    const bannerEl = document.getElementById("vizCastBanner");
    if (bannerEl && wArch) {
      bannerEl.textContent = `⚔️ ${wArch.name.toUpperCase()} AUTO-SWING — ${wArch.autoAttackBehavior.toUpperCase()}`;
    }

    const hx = arena.hero.x;
    const hy = arena.hero.y;
    const primary = liveEnemies[0] || { x: arena.aim.x, y: arena.aim.y };
    const ang = Math.atan2(primary.y - hy, primary.x - hx);
    const wid = sim.weaponId;

    if (wid === "bow_2h" || wid === "crossbow_2h" || wid === "staff_wand_focus") {
      const isPierce = wid === "crossbow_2h";
      const col = wid === "staff_wand_focus" ? "#7ce4ff" : wid === "crossbow_2h" ? "#ffd166" : "#9df0cc";
      arena.projectiles.push({
        x: hx + 0.3,
        y: hy,
        vx: Math.cos(ang) * (wid === "crossbow_2h" ? 9.2 : 8.0),
        vy: Math.sin(ang) * (wid === "crossbow_2h" ? 9.2 : 8.0),
        r: 0.38,
        ttl: 1.2,
        pierce: isPierce,
        dmg: 20,
        color: col,
        status: wid === "crossbow_2h" ? "ARMOR PIERCE" : wid === "staff_wand_focus" ? "ARCANE BOLT" : "SNAP SHOT",
        hitSet: new Set(),
      });
    } else {
      // Melee lunge into contact range so weapon reach & arc geometry read clearly!
      arena.hero.x = Math.max(-3.2, primary.x - Math.min(2.2, Number(wArch.reachMeters || 1.8) * 0.62));
      arena.hero.y = primary.y * 0.55;
      const maxHits = sim.maxTargetsBase || 2;
      const targets = liveEnemies.slice(0, maxHits);
      if (wid === "polearm_2h" || wid === "axe_1h_2h" || wid === "sword_1h_2h") {
        arena.slashes.push({ kind: wid === "polearm_2h" ? "ring360" : "cone_wave", x: arena.hero.x + 0.5, y: arena.hero.y, radius: wid === "polearm_2h" ? 1.85 : 1.35, color: "#ffd166", age: 0, life: 0.36, delay: 0 });
      } else if (wid === "spear_javelin") {
        arena.slashes.push({ kind: "giant_lance", x: arena.hero.x, y: arena.hero.y, angle: 0, len: 2.8, color: "#7ce4ff", age: 0, life: 0.34, delay: 0 });
      } else if (wid === "dagger_claw") {
        arena.slashes.push({ kind: "claw_x", x: primary.x, y: primary.y, color: "#ff7aa2", age: 0, life: 0.3, delay: 0 });
      } else {
        arena.zones.push({ x: primary.x, y: primary.y, r: 1.25, ttl: 0.38, maxTtl: 0.38, tickCd: 9, color: "#f5c469", status: "CONCUSS", kind: "crater" });
      }
      targets.forEach((en, idx) => {
        const mult = idx === 0 ? 1.0 : sim.secondaryMultBase || 0.75;
        const tSim = evalActiveHeroCombat({
          modifierId: "none",
          skillDamageMult: 1.0,
          targetTier: en.elite ? (matrixState.targetTier === "boss" ? "boss" : "elite") : matrixState.targetTier,
        });
        hitEnemy(en, tSim.finalHitDamage * mult, idx === 0 ? "CLEAN HIT" : "CLEAVE", "#ffe082", true);
      });
    }
    renderArenaCombatTelemetry();
  }

  function renderArenaCombatTelemetry() {
    const el = document.getElementById("arenaCombatTelemetry");
    if (!el) return;
    const sim = evalActiveHeroCombat();
    const pacing = evaluateLivePacingMatrix();
    const badge = document.getElementById("matrixStatusBadge");
    if (badge) {
      badge.textContent = `${pacing.inBoxCount}/15`;
    }

    const lvls = [1, 24, 30, 60, 90];
    const gears = [
      { id: "starter", label: "Starter" },
      { id: "mid", label: "Mid" },
      { id: "endgame", label: "Endgame" },
    ];
    const tiers = [
      { id: "trash", label: "Swarm (3h)" },
      { id: "standard", label: "Standard (5h)" },
      { id: "elite", label: "Elite (12h)" },
      { id: "pvp_duel", label: "PvP (8h)" },
    ];

    el.innerHTML = `
      <div class="act-top-row">
        <div class="act-QuickControls">
          <span class="act-pill-lbl">Lvl:</span>
          ${lvls
            .map(
              (lv) =>
                `<button type="button" class="act-mini-btn ${sim.level === lv ? "active" : ""}" data-act-lvl="${lv}">${lv}</button>`
            )
            .join("")}
          <span class="act-pill-lbl" style="margin-left:4px;">Gear:</span>
          ${gears
            .map(
              (g) =>
                `<button type="button" class="act-mini-btn ${sim.gearTier === g.id ? "active" : ""}" data-act-gear="${g.id}">${g.label}</button>`
            )
            .join("")}
          <span class="act-pill-lbl" style="margin-left:4px;">Vs:</span>
          ${tiers
            .map(
              (t) =>
                `<button type="button" class="act-mini-btn ${sim.targetTier === t.id ? "active" : ""}" data-act-tier="${t.id}">${t.label}</button>`
            )
            .join("")}
        </div>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span class="act-box-badge ${sim.inTargetBox ? "ok" : "warn"}">
            ${sim.inTargetBox ? "✓ IN TARGET BOX" : "⚠ OUTSIDE BOX"} (${sim.targetBox[0]}–${sim.targetBox[1]} ${sim.targetTier === "boss" ? "s" : "hits"})
          </span>
          <button type="button" class="act-mini-btn" id="btnActOpenMatrix" title="Open Full Blood Crown Game Matrix &amp; Pacing Engine">⚖️ Matrix (${pacing.inBoxCount}/15)</button>
        </div>
      </div>
      <div class="act-metrics-grid">
        <div class="act-metric">
          <span class="act-metric-k">Hit Damage (Zero AR)</span>
          <span class="act-metric-v gold">${Math.round(sim.finalHitDamage)} · 100% Hit</span>
        </div>
        <div class="act-metric">
          <span class="act-metric-k">${esc(sim.targetLabel)}</span>
          <span class="act-metric-v ${sim.inTargetBox ? "emerald" : "crimson"}">${sim.hitsToKill} hits (${sim.secondsToKill}s)</span>
        </div>
        <div class="act-metric">
          <span class="act-metric-k">5-Mob Pack Clear</span>
          <span class="act-metric-v cyan">${sim.packSwingsToClear5} swings (${sim.packSecondsToClear5}s)</span>
        </div>
        <div class="act-metric">
          <span class="act-metric-k">Poise Stagger (≥12%)</span>
          <span class="act-metric-v ${sim.triggersPoiseFlinch ? "gold" : ""}">${sim.poiseHitPctMaxHp}% HP ${sim.triggersPoiseFlinch ? "⚡" : ""}</span>
        </div>
        <div class="act-metric">
          <span class="act-metric-k">Arena Kills / Staggers</span>
          <span class="act-metric-v emerald">${arena.kills || 0} 💀 · ${arena.poiseTriggers || 0} ⚡</span>
        </div>
      </div>
    `;

    el.querySelectorAll("[data-act-lvl]").forEach((b) =>
      b.addEventListener("click", () => {
        matrixState.level = parseInt(b.dataset.actLvl, 10) || 30;
        resetArenaDummies();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      })
    );
    el.querySelectorAll("[data-act-gear]").forEach((b) =>
      b.addEventListener("click", () => {
        matrixState.gearTier = b.dataset.actGear;
        renderArenaCombatTelemetry();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      })
    );
    el.querySelectorAll("[data-act-tier]").forEach((b) =>
      b.addEventListener("click", () => {
        matrixState.targetTier = b.dataset.actTier;
        resetArenaDummies();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      })
    );
    const openMatBtn = document.getElementById("btnActOpenMatrix");
    if (openMatBtn) {
      openMatBtn.addEventListener("click", () => {
        if (isMobileViewport()) setMobileTab("matrix");
        else setActiveMode("matrix");
      });
    }
  }

  function triggerSkillPreview(skillId, resetFirst, overrideModId) {
    const sk = getSkill(skillId);
    if (!sk) return;
    if (resetFirst) {
      resetArenaDummies();
    }
    arena.autoTimer = 2.65;

    const activeMod = overrideModId ? getModifier(overrideModId) : getActiveSkillModifierForBuild(skillId);

    const ch = sk.choreography || {
      pattern: "powershot_pierce_rail",
      color1: "#67c4ff",
      color2: "#ffe07d",
      count: 1,
      radius: 1.8,
      hitStatus: "HIT!",
    };
    const pat = ch.pattern || "powershot_pierce_rail";
    const c1 = ch.color1 || "#67c4ff";
    const c2 = ch.color2 || "#ffe07d";
    const status = ch.hitStatus || "STRUCK";

    const bannerEl = document.getElementById("vizCastBanner");
    if (bannerEl) {
      const modSuffix = activeMod ? ` [⚡ ${activeMod.name.split("(")[0].trim().toUpperCase()}]` : "";
      bannerEl.textContent = `${sk.name.toUpperCase()} — ${(sk.castType || pat).toUpperCase()}${modSuffix}`;
    }

    const hx = arena.hero.x;
    const hy = arena.hero.y;
    const tx = arena.aim.x;
    const ty = arena.aim.y;
    const baseAngle = Math.atan2(ty - hy, tx - hx);

    // Dispatch across all bespoke choreography patterns!
    switch (pat) {
      case "rapid_jab_3": {
        for (let i = 0; i < 3; i++) {
          arena.slashes.push({
            kind: "thrust", x: hx, y: hy, angle: baseAngle + (i - 1) * 0.14,
            len: 2.5, color: i === 2 ? c2 : c1, delay: i * 0.13, age: 0, life: 0.28,
            onStart: () => {
              arena.enemies.slice(0, 2).forEach((e) => hitEnemy(e, 14, i === 2 ? status : "", c1));
            },
          });
        }
        break;
      }
      case "vault_back_shot": {
        const target = arena.enemies[1] || arena.enemies[0];
        arena.hero.x = target.x - 0.7;
        arena.hero.y = target.y;
        hitEnemy(target, 22, "VAULT-PRIMED", c1);
        arena.slashes.push({ kind: "arc", x: arena.hero.x, y: arena.hero.y, angle: 0, radius: 1.1, color: c1, delay: 0, age: 0, life: 0.3 });
        arena.slashes.push({
          kind: "dash_trail", x: arena.hero.x, y: arena.hero.y, tx: -3.4, ty: 0.3, color: c2, delay: 0.18, age: 0, life: 0.35,
          onStart: () => {
            arena.hero.x = -3.4; arena.hero.y = 0.3;
            arena.projectiles.push({ x: -3.2, y: 0.3, vx: Math.cos(baseAngle) * 9.5, vy: Math.sin(baseAngle) * 9.5, r: 0.22, color: c2, pierce: true, status, hitIds: new Set(), life: 1.2 });
          },
        });
        break;
      }
      case "charged_bolt_release": {
        arena.slashes.push({ kind: "thrust", x: hx, y: hy, angle: baseAngle, len: 1.9, color: c1, delay: 0, age: 0, life: 0.26 });
        const count = ch.count || 6;
        for (let i = 0; i < count; i++) {
          const ang = baseAngle + (i - (count - 1) / 2) * 0.18;
          arena.projectiles.push({
            x: hx + 0.8, y: hy, vx: Math.cos(ang) * 5.2, vy: Math.sin(ang) * 5.2,
            wavy: true, phase: i * 1.3, r: 0.18, color: c1, pierce: false, status, hitIds: new Set(), life: 1.35,
          });
        }
        break;
      }
      case "wall_pin_spear": {
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle) * 9.2, vy: Math.sin(baseAngle) * 9.2,
          r: 0.24, color: c1, pierce: false, wallPin: true, status: "WALL-PIN STUN!", hitIds: new Set(), life: 1.3,
        });
        break;
      }
      case "whirl_sweep_360": {
        arena.hero.x = 0.9; arena.hero.y = 0.0;
        arena.slashes.push({ kind: "ring360", x: 0.9, y: 0.0, radius: ch.radius || 2.1, color: c1, color2: c2, delay: 0, age: 0, life: 0.55 });
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - 0.9, e.y) <= (ch.radius || 2.2)) hitEnemy(e, 28, status, c1);
        });
        break;
      }
      case "dash_skewer_line":
      case "shield_charge_slam": {
        const endX = pat === "shield_charge_slam" ? 1.5 : 2.9;
        arena.slashes.push({ kind: "dash_trail", x: hx, y: hy, tx: endX, ty: ty, color: c1, delay: 0, age: 0, life: 0.42 });
        arena.hero.x = endX; arena.hero.y = ty;
        arena.zones.push({ x: endX, y: ty, r: 1.35, color: c2, kind: "burst", age: 0, life: 0.55 });
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - endX, e.y - ty) < 1.7) hitEnemy(e, 30, status, c2);
        });
        break;
      }
      case "harpoon_pull": {
        const victim = arena.enemies[3] || arena.enemies[1];
        arena.beams.push({
          kind: "harpoon", x1: hx, y1: hy, target: victim, color: c1, age: 0, life: 0.75,
          pulled: false, status,
        });
        break;
      }
      case "stance_axes_toggle":
      case "boomerang_axes": {
        [-1, 1].forEach((side) => {
          arena.projectiles.push({
            x: hx, y: hy, startX: hx, startY: hy, targetX: tx + 1.2, targetY: ty,
            boomerangSide: side, t: 0, r: 0.24, color: c1, pierce: true, status, hitIds: new Set(), life: 1.25,
          });
        });
        break;
      }
      case "poison_javelin_cloud": {
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle) * 7.5, vy: Math.sin(baseAngle) * 7.5,
          r: 0.22, color: c1, pierce: true, trailZone: true, onEndZone: { r: ch.radius || 2.1, color: c1, dotStatus: status },
          status, hitIds: new Set(), life: 0.65,
        });
        break;
      }
      case "delayed_detonate_spear": {
        const victim = arena.enemies[3] || arena.enemies[1];
        arena.projectiles.push({
          x: hx, y: hy, vx: (victim.x - hx) * 2.5, vy: (victim.y - hy) * 2.5,
          r: 0.22, color: c1, stickyTarget: victim, detonateColor: c2, status, hitIds: new Set(), life: 0.4,
        });
        break;
      }
      case "ricochet_bounce": {
        const first = arena.enemies[0];
        arena.projectiles.push({
          x: hx, y: hy, vx: (first.x - hx) * 2.8, vy: (first.y - hy) * 2.8,
          r: 0.24, color: c1, chainLeft: ch.count || 5, status, hitIds: new Set(), life: 1.8,
        });
        break;
      }
      case "javelin_split_bolts": {
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle) * 8.8, vy: Math.sin(baseAngle) * 8.8,
          r: 0.25, color: c1, splitCount: ch.count || 8, splitColor: c2, status, hitIds: new Set(), life: 1.0,
        });
        break;
      }
      case "falcon_mark_dive": {
        arena.zones.push({ x: tx, y: ty, r: 2.0, color: c2, kind: "falcon_dive", age: 0, life: 1.2, status });
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - tx, e.y - ty) < 2.2) hitEnemy(e, 18, status, c2);
        });
        break;
      }
      case "multishot_cone_fan": {
        const n = ch.count || 8;
        const spread = ((ch.spreadDeg || 52) * Math.PI) / 180;
        for (let i = 0; i < n; i++) {
          const ang = baseAngle - spread / 2 + (spread * i) / Math.max(1, n - 1);
          arena.projectiles.push({
            x: hx, y: hy, vx: Math.cos(ang) * 8.6, vy: Math.sin(ang) * 8.6,
            r: 0.16, color: c1, pierce: false, status, hitIds: new Set(), life: 1.1,
          });
        }
        break;
      }
      case "homing_seeker_arrow": {
        const elite = arena.enemies.find((e) => e.elite) || arena.enemies[0];
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle - 0.55) * 6.8, vy: Math.sin(baseAngle - 0.55) * 6.8,
          homingTarget: elite, r: 0.2, color: c1, pierce: true, rePierce: 2, status, hitIds: new Set(), life: 1.9,
        });
        break;
      }
      case "powershot_pierce_rail": {
        arena.beams.push({ kind: "rail", x1: hx, y1: hy, x2: hx + Math.cos(baseAngle) * 8.2, y2: hy + Math.sin(baseAngle) * 8.2, color: c1, color2: c2, age: 0, life: 0.6 });
        arena.enemies.forEach((e) => {
          const dist = pointToSegmentDist(e.x, e.y, hx, hy, hx + Math.cos(baseAngle) * 8.2, hy + Math.sin(baseAngle) * 8.2);
          if (dist < 0.75) hitEnemy(e, 34, status, c1);
        });
        break;
      }
      case "frost_arrow_rain": {
        arena.zones.push({ x: tx, y: ty, r: ch.radius || 2.1, color: c1, color2: c2, kind: "arrow_rain", age: 0, life: 1.75, dotStatus: status });
        break;
      }
      case "spellblade_arc_lunge":
      case "heavy_overhead_execution": {
        arena.hero.x = 0.2; arena.hero.y = 0.0;
        arena.slashes.push({
          kind: pat === "spellblade_arc_lunge" ? "giant_lance" : "overhead_crack",
          x: 0.2, y: 0.0, angle: baseAngle, len: 3.1, color: c1, color2: c2, delay: 0, age: 0, life: 0.6,
        });
        arena.enemies.forEach((e) => {
          if (e.x > 0 && Math.abs(e.y) < 1.5) hitEnemy(e, 38, status, c1);
        });
        break;
      }
      case "static_nova_ring":
      case "warcry_roar_rings": {
        arena.hero.x = 0.5; arena.hero.y = 0.0;
        for (let k = 0; k < 2; k++) {
          arena.zones.push({ x: 0.5, y: 0.0, r: (ch.radius || 2.6) + k * 0.5, color: k === 0 ? c1 : c2, kind: "expanding_ring", age: -k * 0.16, life: 0.7 });
        }
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - 0.5, e.y) < 3.1) hitEnemy(e, 24, status, c1);
        });
        break;
      }
      case "blink_teleport_burst": {
        arena.zones.push({ x: hx, y: hy, r: 0.9, color: c1, kind: "expanding_ring", age: 0, life: 0.45 });
        arena.hero.x = tx - 0.6; arena.hero.y = ty;
        arena.zones.push({ x: arena.hero.x, y: arena.hero.y, r: 1.6, color: c2, kind: "expanding_ring", age: 0, life: 0.6 });
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - arena.hero.x, e.y - arena.hero.y) < 1.8) hitEnemy(e, 24, status, c2);
        });
        break;
      }
      case "parry_counter_ward": {
        arena.hero.x = -1.2; arena.hero.y = 0.0;
        const attacker = arena.enemies[3] || arena.enemies[0];
        arena.projectiles.push({
          x: attacker.x, y: attacker.y, vx: (-1.2 - attacker.x) * 3.0, vy: (0 - attacker.y) * 3.0,
          r: 0.2, color: "#ff5c5c", enemyShotToParry: true, parryColor: c1, counterTarget: attacker, status, hitIds: new Set(), life: 0.36,
        });
        break;
      }
      case "tether_siphon_beam": {
        const elite = arena.enemies.find((e) => e.elite) || arena.enemies[0];
        arena.beams.push({ kind: "siphon", x1: hx, y1: hy, target: elite, color: c1, color2: c2, age: 0, life: 1.65, status });
        break;
      }
      case "frozen_orb_shards": {
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle) * 3.1, vy: Math.sin(baseAngle) * 3.1,
          r: 0.36, color: c1, shardEmitter: true, shardTimer: 0, shardColor: c2, pierce: true, status, hitIds: new Set(), life: 1.75,
        });
        break;
      }
      case "ice_rampart_wall":
      case "pavise_wall_brace": {
        const cx = pat === "pavise_wall_brace" ? hx + 1.1 : 0.3;
        for (let i = -2; i <= 2; i++) {
          arena.walls.push({
            x: cx + Math.abs(i) * 0.18, y: ty + i * 0.52, r: 0.36, permanent: false,
            kind: pat === "pavise_wall_brace" ? "gold" : "ice", color: c1, ttl: 2.1,
          });
        }
        addFloater(cx, ty - 0.6, status, c1);
        break;
      }
      case "gravity_vortex_pull": {
        arena.zones.push({ x: tx, y: ty, r: ch.radius || 2.3, color: c1, color2: c2, kind: "vortex_pull", age: 0, life: 1.6, dotStatus: status });
        break;
      }
      case "firewall_burn_line":
      case "briar_vine_root": {
        for (let i = -2; i <= 2; i++) {
          arena.zones.push({
            x: tx, y: ty + i * 0.68, r: 0.72, color: c1, color2: c2,
            kind: pat === "briar_vine_root" ? "vines" : "fire_patch", age: 0, life: 1.8, dotStatus: status,
          });
        }
        break;
      }
      case "hydra_turret_spit":
      case "lightning_death_sentry": {
        arena.turrets.push({
          x: -0.4, y: -0.7, kind: pat === "lightning_death_sentry" ? "sentry" : "hydra",
          color: c1, color2: c2, fireTimer: 0.1, ttl: 2.2, status,
        });
        arena.turrets.push({
          x: -0.4, y: 0.8, kind: pat === "lightning_death_sentry" ? "sentry" : "hydra",
          color: c1, color2: c2, fireTimer: 0.28, ttl: 2.2, status,
        });
        break;
      }
      case "meteor_sky_crater":
      case "sky_judgment_bolt": {
        arena.zones.push({
          x: tx, y: ty, r: ch.radius || 2.0, color: c1, color2: c2,
          kind: pat === "sky_judgment_bolt" ? "sky_bolt" : "meteor_drop", age: 0, life: 1.6, dotStatus: status, triggered: false,
        });
        break;
      }
      case "corpse_chain_explosion": {
        arena.corpses.forEach((cp, idx) => {
          cp.popped = false;
          setTimeout(() => {
            cp.popped = true;
            arena.zones.push({ x: cp.x, y: cp.y, r: 1.85, color: c1, color2: c2, kind: "expanding_ring", age: 0, life: 0.65 });
            arena.enemies.forEach((e) => {
              if (Math.hypot(e.x - cp.x, e.y - cp.y) < 2.0) hitEnemy(e, 34, status, c1);
            });
          }, idx * 220);
        });
        break;
      }
      case "skeleton_phalanx_command":
      case "beast_pack_summon":
      case "warband_phalanx_command": {
        arena.allies = [];
        const n = pat === "warband_phalanx_command" ? 5 : 4;
        const unitLabel = pat === "beast_pack_summon" ? "Dire Wolf" : pat === "warband_phalanx_command" ? "Guard" : "Skeleton";
        for (let i = 0; i < n; i++) {
          arena.allies.push({
            x: hx + 0.8, y: -1.1 + (i * 2.2) / Math.max(1, n - 1),
            label: unitLabel, color: c1, ttl: 2.3, status, hitCd: 0.2,
          });
        }
        break;
      }
      case "spiral_hammers_orbit": {
        arena.hero.x = 0.2; arena.hero.y = 0.0;
        const count = ch.count || 3;
        for (let i = 0; i < count; i++) {
          arena.projectiles.push({
            x: 0.2, y: 0.0, spiralOriginX: 0.2, spiralOriginY: 0.0,
            spiralAngle: (i * Math.PI * 2) / count, spiralRadius: 0.35,
            r: 0.24, color: c1, pierce: true, status, hitIds: new Set(), life: 1.85,
          });
        }
        break;
      }
      case "planted_war_banner": {
        arena.zones.push({ x: 0.5, y: 0.0, r: ch.radius || 2.3, color: c1, color2: c2, kind: "banner_aura", age: 0, life: 1.9, dotStatus: status });
        break;
      }
      case "leap_crater_slam": {
        arena.slashes.push({
          kind: "leap_arc", x: hx, y: hy, tx, ty, color: c1, delay: 0, age: 0, life: 0.52,
          onEnd: () => {
            arena.hero.x = tx; arena.hero.y = ty;
            arena.zones.push({ x: tx, y: ty, r: 1.95, color: c2, kind: "expanding_ring", age: 0, life: 0.6 });
            arena.enemies.forEach((e) => {
              if (Math.hypot(e.x - tx, e.y - ty) < 2.1) hitEnemy(e, 34, status, c2);
            });
          },
        });
        break;
      }
      case "sunder_faultline": {
        for (let step = 1; step <= 5; step++) {
          setTimeout(() => {
            const fx = hx + Math.cos(baseAngle) * step * 1.15;
            const fy = hy + Math.sin(baseAngle) * step * 1.15;
            arena.zones.push({ x: fx, y: fy, r: 0.95, color: c1, color2: c2, kind: "expanding_ring", age: 0, life: 0.5 });
            arena.enemies.forEach((e) => {
              if (Math.hypot(e.x - fx, e.y - fy) < 1.15) hitEnemy(e, 26, status, c1);
            });
          }, step * 95);
        }
        break;
      }
      case "whirlwind_spin_path": {
        arena.hero.morph = "whirlwind";
        arena.hero.morphTimer = 1.45;
        arena.hero.whirlColor = c1;
        arena.hero.whirlStatus = status;
        break;
      }
      case "tornado_wandering":
      case "boulder_bowling": {
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle) * 3.8, vy: Math.sin(baseAngle) * 3.8,
          wavy: pat === "tornado_wandering", phase: 0,
          boulder: pat === "boulder_bowling",
          r: 0.45, color: c1, color2: c2, pierce: true, status, hitIds: new Set(), life: 1.65,
        });
        break;
      }
      case "hurricane_eye_aura":
      case "stamina_conditioning_aura": {
        arena.hero.x = pat === "hurricane_eye_aura" ? 0.6 : -1.5;
        arena.hero.y = 0.0;
        arena.hero.aura = { color: c1, color2: c2, r: pat === "hurricane_eye_aura" ? 2.3 : 1.4, status };
        arena.hero.auraTimer = 1.85;
        addFloater(arena.hero.x, arena.hero.y - 0.5, status, c1);
        break;
      }
      case "wolf_pounce_rend": {
        const t = arena.enemies[1] || arena.enemies[0];
        arena.hero.morph = "Dire-Wolf";
        arena.hero.morphTimer = 1.4;
        arena.hero.x = t.x - 0.55; arena.hero.y = t.y;
        arena.slashes.push({ kind: "claw_x", x: t.x, y: t.y, color: c1, color2: c2, delay: 0, age: 0, life: 0.55 });
        hitEnemy(t, 32, status, c1);
        break;
      }
      case "bear_shockwave_roar": {
        arena.hero.morph = "Iron-Bear";
        arena.hero.morphTimer = 1.4;
        arena.hero.x = -0.3; arena.hero.y = 0.0;
        arena.slashes.push({ kind: "cone_wave", x: -0.3, y: 0.0, angle: baseAngle, radius: 3.1, color: c1, delay: 0, age: 0, life: 0.65 });
        arena.enemies.forEach((e) => {
          if (e.x > -0.3 && Math.hypot(e.x + 0.3, e.y) < 3.3) hitEnemy(e, 28, status, c1);
        });
        break;
      }
      case "smoke_blind_ambush": {
        const elite = arena.enemies.find((e) => e.elite) || arena.enemies[0];
        arena.zones.push({ x: 1.2, y: 0.0, r: 2.1, color: "#625a7a", kind: "smoke", age: 0, life: 1.4, dotStatus: "BLINDED" });
        setTimeout(() => {
          arena.hero.x = elite.x + 0.65; arena.hero.y = elite.y;
          arena.slashes.push({ kind: "claw_x", x: elite.x, y: elite.y, color: c2, color2: c1, delay: 0, age: 0, life: 0.5 });
          hitEnemy(elite, 44, status, c2);
        }, 280);
        break;
      }
      case "shadow_clone_decoy": {
        arena.allies = [
          { x: 0.8, y: -0.9, label: "Shadow Double", color: c1, ttl: 2.0, status, hitCd: 0.15 },
          { x: 0.8, y: 0.9, label: "Shadow Double", color: c2, ttl: 2.0, status, hitCd: 0.25 },
        ];
        break;
      }
      case "caltrop_firepot_trap": {
        arena.zones.push({ x: tx - 0.4, y: ty, r: 1.6, color: "#9da8ba", kind: "vines", age: 0, life: 1.7, dotStatus: "CALTROP SLOW" });
        arena.zones.push({ x: tx + 0.5, y: ty, r: 1.4, color: c1, color2: c2, kind: "fire_patch", age: 0, life: 1.7, dotStatus: status });
        break;
      }
      default: {
        arena.projectiles.push({
          x: hx, y: hy, vx: Math.cos(baseAngle) * 8.2, vy: Math.sin(baseAngle) * 8.2,
          r: 0.24, color: c1, pierce: true, status, hitIds: new Set(), life: 1.2,
        });
      }
    }

    if (activeMod && activeMod.arenaVizHook) {
      const hook = activeMod.arenaVizHook;
      const modShort = activeMod.name.split("(")[0].trim().toUpperCase();
      addFloater(arena.hero.x, arena.hero.y - 0.55, `⚡ ${modShort}`, "#ffd166");
      switch (hook) {
        case "charge_ring_heavy_burst": {
          arena.zones.push({ x: hx, y: hy, r: 1.35, color: "#ffd166", kind: "expanding_ring", age: 0, life: 0.5 });
          setTimeout(() => {
            arena.zones.push({ x: tx, y: ty, r: 2.35, color: "#ff9f43", kind: "expanding_ring", age: 0, life: 0.65 });
            arena.enemies.forEach((e) => {
              if (Math.hypot(e.x - tx, e.y - ty) < 2.4) hitEnemy(e, 36, "POISE STAGGER!", "#ffd166");
            });
          }, 340);
          break;
        }
        case "rapid_triple_burst": {
          for (let k = 1; k <= 2; k++) {
            setTimeout(() => {
              const spread = (k - 1.5) * 0.14;
              arena.projectiles.push({
                x: arena.hero.x, y: arena.hero.y,
                vx: Math.cos(baseAngle + spread) * 10.2, vy: Math.sin(baseAngle + spread) * 10.2,
                r: 0.19, color: "#ffe082", pierce: false, status: "FLURRY", hitIds: new Set(), life: 0.85,
              });
            }, k * 115);
          }
          break;
        }
        case "gold_flash_crit_arc": {
          arena.zones.push({ x: hx, y: hy, r: 1.15, color: "#ffd700", kind: "expanding_ring", age: 0, life: 0.42 });
          arena.slashes.push({ kind: "ring360", x: tx, y: ty, radius: 1.55, color: "#ffd700", delay: 0.12, age: 0, life: 0.42 });
          const primeTgt = arena.enemies.find((e) => e.elite) || arena.enemies[1] || arena.enemies[0];
          if (primeTgt) hitEnemy(primeTgt, 30, "PERFECT CRIT 1.5×!", "#ffd700");
          break;
        }
        case "fan_split_aoe_4": {
          arena.projectiles = [];
          for (let i = 0; i < 4; i++) {
            const ang = baseAngle + (i - 1.5) * 0.22;
            arena.projectiles.push({
              x: hx, y: hy, vx: Math.cos(ang) * 7.8, vy: Math.sin(ang) * 7.8,
              r: 0.21, color: c2, pierce: false, status: "SPLIT SPLASH", hitIds: new Set(), life: 1.05,
              onEndZone: { r: 1.05, color: c1, dotStatus: status },
            });
          }
          break;
        }
        case "piercing_line_rail": {
          const ex = hx + Math.cos(baseAngle) * 7.8;
          const ey = hy + Math.sin(baseAngle) * 7.8;
          arena.beams.push({ kind: "rail", x1: hx, y1: hy, x2: ex, y2: ey, color: "#8be9fd", color2: "#ffffff", age: 0, life: 0.48 });
          arena.enemies.forEach((e) => {
            if (pointToSegmentDist(e.x, e.y, hx, hy, ex, ey) < 0.75) {
              hitEnemy(e, 26, "PIERCED -25% ARMOR", "#8be9fd");
            }
          });
          break;
        }
        case "chain_bounce_3": {
          arena.projectiles.push({
            x: hx, y: hy, vx: Math.cos(baseAngle) * 8.6, vy: Math.sin(baseAngle) * 8.6,
            r: 0.22, color: "#74d4ff", pierce: false, chainLeft: 3, status: "RICOCHET!", hitIds: new Set(), life: 1.45,
          });
          break;
        }
        case "boomerang_out_back": {
          arena.projectiles.push({
            x: hx, y: hy, startX: hx, startY: hy, targetX: tx + 1.1, targetY: ty,
            boomerangSide: 1, t: 0, r: 0.25, color: "#ffd166", pierce: true, status: "RETURN SLICE", hitIds: new Set(), life: 1.35,
          });
          break;
        }
        case "wide_arc_cleave_160": {
          arena.slashes.push({ kind: "cone_wave", x: hx + 0.5, y: hy, angle: baseAngle, radius: 2.9, color: c2, delay: 0, age: 0, life: 0.55 });
          arena.enemies.slice(0, 5).forEach((e, idx) => hitEnemy(e, idx === 0 ? 28 : 18, "CLEAVED", c2));
          break;
        }
        case "tight_bullseye_slam": {
          const focus = arena.enemies.find((e) => e.elite) || arena.enemies[1] || arena.enemies[0];
          if (focus) {
            arena.zones.push({ x: focus.x, y: focus.y, r: 0.92, color: "#ff6b6b", kind: "expanding_ring", age: 0, life: 0.55 });
            hitEnemy(focus, 40, "BULLSEYE +35%!", "#ff6b6b");
          }
          break;
        }
        case "orbiting_ring_3": {
          arena.projectiles = [];
          for (let k = 0; k < 3; k++) {
            arena.projectiles.push({
              x: hx, y: hy, spiralOriginX: hx + 1.2, spiralOriginY: hy,
              spiralAngle: (k * Math.PI * 2) / 3, spiralRadius: 0.85,
              r: 0.22, color: c1, pierce: true, status: "ORBIT WARD", hitIds: new Set(), life: 1.55,
            });
          }
          arena.hero.aura = { color: c1, color2: c2, r: 1.85, status: "ORBIT WARD" };
          arena.hero.auraTimer = 1.6;
          break;
        }
        case "persistent_floor_wake": {
          arena.zones.push({ x: tx, y: ty, r: 1.85, color: "#ff7b54", color2: "#ffd166", kind: "fire_patch", age: 0, life: 2.1, dotStatus: "SCORCHED WAKE" });
          break;
        }
        case "placed_floor_trap": {
          arena.zones.push({ x: tx - 0.35, y: ty, r: 1.45, color: "#ffd166", color2: c1, kind: "vines", age: 0, life: 1.9, dotStatus: "ARMED TRAP +25%" });
          setTimeout(() => {
            arena.zones.push({ x: tx - 0.35, y: ty, r: 1.95, color: c2, kind: "expanding_ring", age: 0, life: 0.55 });
            arena.enemies.forEach((e) => {
              if (Math.hypot(e.x - (tx - 0.35), e.y - ty) < 2.0) hitEnemy(e, 30, "TRAP DETONATED!", c2);
            });
          }, 480);
          break;
        }
        case "anchored_sentry_fire": {
          arena.turrets.push({
            x: hx + 1.35, y: hy - 0.75, kind: "sentry", color: c1, color2: c2, status: "SENTRY VOLLEY", ttl: 2.35, fireTimer: 0.12,
          });
          break;
        }
        case "harpoon_pull_line": {
          const pullTarget = arena.enemies[4] || arena.enemies[3] || arena.enemies[0];
          if (pullTarget) {
            arena.beams.push({ kind: "harpoon", x1: hx, y1: hy, target: pullTarget, color: "#ffd166", status: "HARPOON YANK!", age: 0, life: 0.75 });
          }
          break;
        }
        case "knockback_wall_pin": {
          arena.projectiles.push({
            x: hx, y: hy, vx: Math.cos(baseAngle) * 9.2, vy: Math.sin(baseAngle) * 9.2,
            r: 0.24, color: "#ffd166", wallPin: true, pierce: false, status: "WALL-PIN!", hitIds: new Set(), life: 1.15,
          });
          break;
        }
        case "recoil_backstep_cast": {
          const prevX = arena.hero.x;
          const prevY = arena.hero.y;
          const backX = Math.max(-4.5, prevX - 1.35);
          arena.slashes.push({ kind: "dash_trail", x: prevX, y: prevY, tx: backX, ty: prevY - 0.3, color: "#8be9fd", delay: 0.05, age: 0, life: 0.38 });
          arena.hero.x = backX;
          arena.hero.y = prevY - 0.3;
          addFloater(arena.hero.x, arena.hero.y - 0.3, "EVADE STEP", "#8be9fd");
          break;
        }
        case "frost_chill_burst": {
          arena.zones.push({ x: tx, y: ty, r: 1.9, color: "#74d4ff", color2: "#e0f7ff", kind: "expanding_ring", age: 0, life: 0.6 });
          arena.enemies.forEach((e) => {
            if (Math.hypot(e.x - tx, e.y - ty) < 2.15) hitEnemy(e, 18, "RIME FROZEN!", "#74d4ff");
          });
          break;
        }
        case "crimson_bleed_slash": {
          const bTarget = arena.enemies[1] || arena.enemies[0];
          if (bTarget) {
            arena.slashes.push({ kind: "claw_x", x: bTarget.x, y: bTarget.y, color: "#e63946", color2: "#ffb3c1", delay: 0.05, age: 0, life: 0.5 });
            hitEnemy(bTarget, 22, "OPEN WOUNDS BLEED", "#e63946");
          }
          break;
        }
        case "warband_focus_mark": {
          const marked = arena.enemies.find((e) => e.elite) || arena.enemies[0];
          arena.allies.push(
            { x: hx + 1.0, y: hy - 0.85, label: "Vanguard", color: "#52d69a", ttl: 1.9, status: "SQUAD FOCUS!", hitCd: 0.1 },
            { x: hx + 1.0, y: hy + 0.85, label: "Arbalest", color: "#ffd166", ttl: 1.9, status: "SQUAD FOCUS!", hitCd: 0.2 }
          );
          if (marked) {
            arena.beams.push({ kind: "rail", x1: hx + 1.0, y1: hy - 0.85, x2: marked.x, y2: marked.y, color: "#ffd166", color2: "#ffffff", age: 0, life: 0.38 });
            hitEnemy(marked, 26, "PACK MARKED +20%", "#52d69a");
          }
          break;
        }
        case "triple_ammo_pips": {
          addFloater(hx, hy - 0.85, "▮▮▮ 3 CHARGES READY", "#52d69a");
          setTimeout(() => {
            arena.projectiles.push({
              x: arena.hero.x, y: arena.hero.y,
              vx: Math.cos(baseAngle + 0.08) * 8.8, vy: Math.sin(baseAngle + 0.08) * 8.8,
              r: 0.2, color: "#52d69a", pierce: true, status: "CHARGE 2/3", hitIds: new Set(), life: 0.95,
            });
          }, 190);
          break;
        }
        case "crimson_execute_reset": {
          const execTgt = arena.enemies[0] || arena.enemies[1];
          if (execTgt) {
            arena.slashes.push({ kind: "claw_x", x: execTgt.x, y: execTgt.y, color: "#ff4d6d", color2: "#ffd166", delay: 0.06, age: 0, life: 0.5 });
            hitEnemy(execTgt, 45, "CULLING RESET!", "#ff4d6d");
          }
          break;
        }
        default:
          break;
      }
    }
  }

  function pointToSegmentDist(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function playActiveBuildCombo(opts) {
    const hs = currentHeroState();
    const activeBuild = currentActiveBuild();
    const rot = (activeBuild.rotation || [])
      .map((r) => (r && r.skillId ? r.skillId : ""))
      .filter((sid) => sid && (ALL_SKILLS.has(sid) || WEAPON_GRANTED_SKILLS.has(sid)));
    const ids = rot.length ? rot : deriveBuildRotationIds(activeBuild, hs);
    if (!ids.length) {
      triggerSkillPreview(hs.selectedSkillId, Boolean(opts && opts.resetPack));
      return;
    }
    if (opts && opts.resetPack) {
      resetArenaDummies();
    }
    arena.comboSequenceIds = [...ids];
    arena.comboQueue = [...ids];
    arena.comboTimer = 0.04;
    arena.activeComboIndex = -1;
    arena.activeComboSkillId = null;
  }

  let lastTs = performance.now();
  function tickArena(now) {
    const rawDt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    const dt = state.slowMo ? rawDt * 0.42 : rawDt;

    // Combo Queue, Continuous Build Loop, or Single-Skill Auto-Loop
    if (arena.comboQueue.length > 0) {
      arena.comboTimer -= dt;
      if (arena.comboTimer <= 0) {
        const nextId = arena.comboQueue.shift();
        const seqLen = Math.max(1, (arena.comboSequenceIds || []).length);
        const stepIdx = Math.max(0, seqLen - arena.comboQueue.length - 1);
        arena.activeComboSkillId = nextId;
        arena.activeComboIndex = stepIdx;
        currentHeroState().selectedSkillId = nextId;
        renderSkillBreakdown();
        syncSelectedHighlights();
        if (normalizeMode(state.activeMode) === "builds") {
          renderBuildComboStage();
        }
        triggerSkillPreview(nextId, false);
        const bannerEl = document.getElementById("vizCastBanner");
        if (bannerEl && normalizeMode(state.activeMode) === "builds") {
          const activeBuild = currentActiveBuild();
          const sk = getSkill(nextId);
          const stepMod = getActiveSkillModifierForBuild(nextId, activeBuild);
          const modLabel = stepMod ? ` [⚡ ${stepMod.name.split("(")[0].trim().toUpperCase()}]` : "";
          bannerEl.textContent = `STEP ${stepIdx + 1}/${seqLen} (${activeBuild.name.toUpperCase()}) — ${sk.name.toUpperCase()}${modLabel}`;
        }
        arena.comboTimer = 1.15;
      }
    } else if (state.comboLoop && normalizeMode(state.activeMode) === "builds") {
      arena.comboTimer -= dt;
      if (arena.comboTimer <= 0) {
        playActiveBuildCombo({ resetPack: true });
      }
    } else {
      if (arena.activeComboIndex !== -1 && arena.comboTimer > 0) {
        arena.comboTimer -= dt;
        if (arena.comboTimer <= 0) {
          arena.activeComboIndex = -1;
          arena.activeComboSkillId = null;
          if (normalizeMode(state.activeMode) === "builds") {
            renderBuildComboStage();
          }
        }
      }
      if (state.autoLoop) {
        arena.autoTimer -= dt;
        if (arena.autoTimer <= 0) {
          triggerSkillPreview(currentHeroState().selectedSkillId, true);
        }
      }
    }

    // Hero morph / whirlwind / aura updates
    if (arena.hero.morphTimer > 0) {
      arena.hero.morphTimer -= dt;
      if (arena.hero.morph === "whirlwind") {
        arena.hero.x += 2.6 * dt;
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - arena.hero.x, e.y - arena.hero.y) < 1.35 && Math.random() < 0.25) {
            hitEnemy(e, 9, arena.hero.whirlStatus, arena.hero.whirlColor);
          }
        });
      }
      if (arena.hero.morphTimer <= 0) arena.hero.morph = null;
    } else {
      arena.hero.x += (arena.hero.baseX - arena.hero.x) * Math.min(1, dt * 1.4);
      arena.hero.y += (arena.hero.baseY - arena.hero.y) * Math.min(1, dt * 1.4);
    }

    if (arena.hero.auraTimer > 0) {
      arena.hero.auraTimer -= dt;
      if (arena.hero.aura) {
        arena.enemies.forEach((e) => {
          if (Math.hypot(e.x - arena.hero.x, e.y - arena.hero.y) < arena.hero.aura.r && Math.random() < 0.12) {
            hitEnemy(e, 7, arena.hero.aura.status, arena.hero.aura.color);
          }
        });
      }
      if (arena.hero.auraTimer <= 0) arena.hero.aura = null;
    }

    // Temporary walls
    arena.walls = arena.walls.filter((w) => {
      if (!w.permanent) w.ttl -= dt;
      return w.permanent || w.ttl > 0;
    });

    // Enemies gentle patrol + poise / flinch / respawn timers (no fake combat regen!)
    arena.enemies.forEach((e, idx) => {
      if (e.respawnTtl > 0) {
        e.respawnTtl -= dt;
        if (e.respawnTtl <= 0) {
          e.respawnTtl = 0;
          e.hp = e.maxHp;
          e.x = e.bx;
          e.y = e.by;
          e.status = "";
          e.statusTtl = 0;
          e.flinchTtl = 0;
          e.poiseImmuneTtl = 0;
        }
        return;
      }
      if (e.flinchTtl > 0) e.flinchTtl = Math.max(0, e.flinchTtl - dt);
      if (e.poiseImmuneTtl > 0) e.poiseImmuneTtl = Math.max(0, e.poiseImmuneTtl - dt);
      if (e.statusTtl > 0) {
        e.statusTtl -= dt;
        if (e.statusTtl <= 0) e.status = "";
      }
      const frozen = /FROZEN|STUN|PIN|ROOT/i.test(e.status) || e.flinchTtl > 0;
      if (!frozen) {
        const sway = Math.sin(now * 0.002 + idx) * 0.18;
        e.x += (e.bx + sway - e.x) * dt * 1.8;
        e.y += (e.by - e.y) * dt * 1.8;
      }
    });

    // Allies (Skeletons / Dire Wolves / Warband / Clones)
    arena.allies = arena.allies.filter((al) => {
      al.ttl -= dt;
      al.hitCd -= dt;
      const nearest = arena.enemies
        .filter((e) => !e.respawnTtl || e.respawnTtl <= 0)
        .reduce((best, e) => (!best || Math.hypot(e.x - al.x, e.y - al.y) < Math.hypot(best.x - al.x, best.y - al.y) ? e : best), null);
      if (nearest) {
        const d = Math.hypot(nearest.x - al.x, nearest.y - al.y);
        if (d > 0.55) {
          al.x += ((nearest.x - al.x) / d) * 2.7 * dt;
          al.y += ((nearest.y - al.y) / d) * 2.7 * dt;
        } else if (al.hitCd <= 0) {
          al.hitCd = 0.55;
          hitEnemy(nearest, 14, al.status, al.color);
        }
      }
      return al.ttl > 0;
    });

    // Turrets (Hydra / Lightning & Death Sentry)
    arena.turrets = arena.turrets.filter((tr) => {
      tr.ttl -= dt;
      tr.fireTimer -= dt;
      if (tr.fireTimer <= 0) {
        tr.fireTimer = 0.48;
        const tgt = arena.enemies[Math.floor(Math.random() * arena.enemies.length)];
        if (tgt) {
          if (tr.kind === "sentry") {
            arena.beams.push({ kind: "rail", x1: tr.x, y1: tr.y, x2: tgt.x, y2: tgt.y, color: tr.color, color2: tr.color2, age: 0, life: 0.25 });
            hitEnemy(tgt, 18, tr.status, tr.color);
          } else {
            const ang = Math.atan2(tgt.y - tr.y, tgt.x - tr.x);
            arena.projectiles.push({
              x: tr.x, y: tr.y, vx: Math.cos(ang) * 7.2, vy: Math.sin(ang) * 7.2,
              r: 0.18, color: tr.color, pierce: false, status: tr.status, hitIds: new Set(), life: 0.9,
            });
          }
        }
      }
      return tr.ttl > 0;
    });

    // Projectiles
    const spawned = [];
    arena.projectiles = arena.projectiles.filter((p) => {
      p.life -= dt;
      if (p.boomerangSide) {
        p.t += dt / 1.2;
        const u = Math.min(1, p.t);
        const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
        const perpX = -Math.sin(angle) * p.boomerangSide * 1.45;
        const perpY = Math.cos(angle) * p.boomerangSide * 1.45;
        const midX = (p.startX + p.targetX) * 0.5 + perpX;
        const midY = (p.startY + p.targetY) * 0.5 + perpY;
        if (u <= 0.5) {
          const s = u * 2;
          p.x = (1 - s) * (1 - s) * p.startX + 2 * (1 - s) * s * midX + s * s * p.targetX;
          p.y = (1 - s) * (1 - s) * p.startY + 2 * (1 - s) * s * midY + s * s * p.targetY;
        } else {
          const s = (u - 0.5) * 2;
          const midBackX = (p.startX + p.targetX) * 0.5 - perpX * 0.6;
          const midBackY = (p.startY + p.targetY) * 0.5 - perpY * 0.6;
          p.x = (1 - s) * (1 - s) * p.targetX + 2 * (1 - s) * s * midBackX + s * s * arena.hero.x;
          p.y = (1 - s) * (1 - s) * p.targetY + 2 * (1 - s) * s * midBackY + s * s * arena.hero.y;
        }
      } else if (typeof p.spiralAngle === "number") {
        p.spiralAngle -= dt * 5.2;
        p.spiralRadius += dt * 1.45;
        p.x = p.spiralOriginX + Math.cos(p.spiralAngle) * p.spiralRadius;
        p.y = p.spiralOriginY + Math.sin(p.spiralAngle) * p.spiralRadius;
      } else {
        if (p.homingTarget) {
          const desired = Math.atan2(p.homingTarget.y - p.y, p.homingTarget.x - p.x);
          const spd = Math.hypot(p.vx, p.vy) || 7;
          p.vx += (Math.cos(desired) * spd - p.vx) * dt * 4.5;
          p.vy += (Math.sin(desired) * spd - p.vy) * dt * 4.5;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.wavy) {
          p.phase += dt * 14;
          p.y += Math.cos(p.phase) * 2.2 * dt;
        }
      }

      // Frozen Orb 360° shard emitter
      if (p.shardEmitter) {
        p.shardTimer -= dt;
        if (p.shardTimer <= 0) {
          p.shardTimer = 0.14;
          for (let k = 0; k < 4; k++) {
            const a = p.life * 7 + (k * Math.PI) / 2;
            spawned.push({
              x: p.x, y: p.y, vx: Math.cos(a) * 5.8, vy: Math.sin(a) * 5.8,
              r: 0.13, color: p.shardColor, pierce: false, status: p.status, hitIds: new Set(), life: 0.45,
            });
          }
        }
      }

      if (p.trailZone && Math.random() < 0.35) {
        arena.zones.push({ x: p.x, y: p.y, r: 0.65, color: p.color, kind: "poison_cloud", age: 0, life: 0.9, dotStatus: p.status });
      }

      // Enemy shot parried by hero!
      if (p.enemyShotToParry && Math.hypot(p.x - arena.hero.x, p.y - arena.hero.y) < 0.7) {
        arena.zones.push({ x: arena.hero.x, y: arena.hero.y, r: 1.0, color: p.parryColor, kind: "expanding_ring", age: 0, life: 0.4 });
        addFloater(arena.hero.x, arena.hero.y - 0.4, "PERFECT PARRY!", p.parryColor);
        arena.beams.push({ kind: "rail", x1: arena.hero.x, y1: arena.hero.y, x2: p.counterTarget.x, y2: p.counterTarget.y, color: p.parryColor, color2: "#ffffff", age: 0, life: 0.45 });
        hitEnemy(p.counterTarget, 38, p.status, p.parryColor);
        return false;
      }

      if (!p.enemyShotToParry) {
        for (const en of arena.enemies) {
          if (p.hitIds.has(en.id)) continue;
          if (Math.hypot(en.x - p.x, en.y - p.y) < 0.55 + p.r) {
            p.hitIds.add(en.id);
            hitEnemy(en, p.boulder ? 28 : 20, p.status, p.color);

            if (p.boulder) {
              en.y += en.y >= 0 ? 0.55 : -0.55;
            }
            if (p.wallPin) {
              const wall = arena.walls[0];
              en.x = wall.x - 0.55;
              en.y = wall.y;
              hitEnemy(en, 30, "WALL-PIN STUN!", "#ffd166");
              arena.zones.push({ x: en.x, y: en.y, r: 1.2, color: "#ffd166", kind: "expanding_ring", age: 0, life: 0.55 });
              return false;
            }
            if (p.splitCount) {
              for (let k = 0; k < p.splitCount; k++) {
                const a = (k * Math.PI * 2) / p.splitCount;
                spawned.push({
                  x: en.x, y: en.y, vx: Math.cos(a) * 6.8, vy: Math.sin(a) * 6.8,
                  r: 0.15, color: p.splitColor, pierce: true, status: "ARC BOLT", hitIds: new Set([en.id]), life: 0.55,
                });
              }
              return false;
            }
            if (p.chainLeft && p.chainLeft > 0) {
              const next = arena.enemies.find((o) => !p.hitIds.has(o.id));
              if (next) {
                const ang = Math.atan2(next.y - en.y, next.x - en.x);
                p.vx = Math.cos(ang) * 8.2;
                p.vy = Math.sin(ang) * 8.2;
                p.chainLeft -= 1;
                break;
              }
              return false;
            }
            if (p.stickyTarget) {
              setTimeout(() => {
                arena.zones.push({ x: en.x, y: en.y, r: 1.85, color: p.detonateColor, kind: "expanding_ring", age: 0, life: 0.6 });
                arena.enemies.forEach((o) => {
                  if (Math.hypot(o.x - en.x, o.y - en.y) < 1.9) hitEnemy(o, 32, p.status, p.detonateColor);
                });
              }, 360);
              return false;
            }
            if (!p.pierce) {
              if (p.onEndZone) {
                arena.zones.push({ x: en.x, y: en.y, r: p.onEndZone.r, color: p.onEndZone.color, kind: "poison_cloud", age: 0, life: 1.6, dotStatus: p.onEndZone.dotStatus });
              }
              return false;
            }
          }
        }
      }

      if (p.life <= 0 && p.onEndZone) {
        arena.zones.push({ x: p.x, y: p.y, r: p.onEndZone.r, color: p.onEndZone.color, kind: "poison_cloud", age: 0, life: 1.5, dotStatus: p.onEndZone.dotStatus });
      }
      return p.life > 0;
    });
    spawned.forEach((s) => arena.projectiles.push(s));

    // Zones
    arena.zones = arena.zones.filter((z) => {
      z.age += dt;
      if (z.age >= 0) {
        if ((z.kind === "meteor_drop" || z.kind === "sky_bolt") && !z.triggered && z.age > 0.42) {
          z.triggered = true;
          arena.enemies.forEach((e) => {
            if (Math.hypot(e.x - z.x, e.y - z.y) < z.r + 0.3) hitEnemy(e, 38, z.dotStatus, z.color);
          });
        }
        if (z.kind === "vortex_pull") {
          arena.enemies.forEach((e) => {
            const d = Math.hypot(z.x - e.x, z.y - e.y);
            if (d < z.r + 0.8 && d > 0.25) {
              e.x += ((z.x - e.x) / d) * 2.3 * dt;
              e.y += ((z.y - e.y) / d) * 2.3 * dt;
              if (Math.random() < 0.08) hitEnemy(e, 6, z.dotStatus, z.color2 || z.color);
            }
          });
        } else if (z.dotStatus && z.kind !== "meteor_drop" && z.kind !== "sky_bolt" && Math.random() < 0.12) {
          arena.enemies.forEach((e) => {
            if (Math.hypot(e.x - z.x, e.y - z.y) < z.r) hitEnemy(e, 7, z.dotStatus, z.color);
          });
        }
      }
      return z.age < z.life;
    });

    // Beams (Harpoon / Rail / Siphon)
    arena.beams = arena.beams.filter((b) => {
      b.age += dt;
      if (b.kind === "harpoon" && b.target && b.age > 0.22) {
        b.target.x += (arena.hero.x + 1.0 - b.target.x) * dt * 7.5;
        b.target.y += (arena.hero.y - b.target.y) * dt * 7.5;
        if (!b.pulled) {
          b.pulled = true;
          hitEnemy(b.target, 24, b.status || "HOOK PULLED!", b.color);
        }
      }
      if (b.kind === "siphon" && b.target && Math.random() < 0.16) {
        hitEnemy(b.target, 9, b.status, b.color);
      }
      return b.age < b.life;
    });

    // Slashes / Leap arcs
    arena.slashes = arena.slashes.filter((s) => {
      if (s.delay > 0) {
        s.delay -= dt;
        if (s.delay <= 0 && s.onStart) s.onStart();
        return true;
      }
      s.age += dt;
      if (s.age >= s.life && s.onEnd) s.onEnd();
      return s.age < s.life;
    });

    // Floaters
    arena.floaters = arena.floaters.filter((f) => {
      f.age += dt;
      return f.age < f.life;
    });

    drawArena(now);
    requestAnimationFrame(tickArena);
  }

  function drawArena(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Isometric stone tile grid
    ctx.lineWidth = 1;
    for (let gx = -5; gx <= 5; gx++) {
      const a = isoProject(gx, -4);
      const b = isoProject(gx, 4);
      ctx.strokeStyle = "rgba(116, 98, 150, 0.14)";
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    for (let gy = -4; gy <= 4; gy++) {
      const a = isoProject(-5, gy);
      const b = isoProject(5, gy);
      ctx.strokeStyle = "rgba(116, 98, 150, 0.14)";
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }

    // Aim reticle
    const aimP = isoProject(arena.aim.x, arena.aim.y);
    ctx.strokeStyle = "rgba(235, 196, 108, 0.45)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.ellipse(aimP.x, aimP.y, 20, 10, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);

    // Zones on floor
    arena.zones.forEach((z) => {
      if (z.age < 0) return;
      const p = isoProject(z.x, z.y);
      const u = Math.min(1, z.age / z.life);
      const rx = z.r * 42 * (z.kind === "expanding_ring" ? 0.35 + u * 0.75 : 1);
      const ry = rx * 0.5;
      ctx.save();
      ctx.globalAlpha = Math.max(0.12, 1 - u * 0.75);
      if (z.kind === "expanding_ring") {
        ctx.strokeStyle = z.color;
        ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
      } else {
        ctx.fillStyle = z.color;
        ctx.globalAlpha = 0.25 * (1 - u * 0.5);
        ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 0.78 * (1 - u * 0.5);
        ctx.strokeStyle = z.color2 || z.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (z.kind === "arrow_rain") {
          for (let i = 0; i < 6; i++) {
            const ox = Math.sin(now * 0.015 + i * 1.7) * rx * 0.65;
            const oy = ((now * 0.28 + i * 28) % 55) - 45;
            ctx.strokeStyle = z.color2 || "#bfe8ff";
            ctx.beginPath(); ctx.moveTo(p.x + ox - 6, p.y + oy - 18); ctx.lineTo(p.x + ox, p.y + oy); ctx.stroke();
          }
        } else if (z.kind === "meteor_drop" && z.age < 0.45) {
          const drop = 1 - z.age / 0.45;
          ctx.fillStyle = z.color;
          ctx.beginPath(); ctx.arc(p.x - drop * 70, p.y - drop * 130, 14, 0, Math.PI * 2); ctx.fill();
        } else if (z.kind === "sky_bolt") {
          ctx.strokeStyle = z.color;
          ctx.lineWidth = 5;
          ctx.beginPath(); ctx.moveTo(p.x, p.y - 140); ctx.lineTo(p.x, p.y); ctx.stroke();
        } else if (z.kind === "banner_aura") {
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y - 34); ctx.stroke();
          ctx.fillStyle = z.color;
          ctx.fillRect(p.x, p.y - 34, 16, 11);
        } else if (z.kind === "falcon_dive") {
          const ang = z.age * 5;
          ctx.fillStyle = "#ffe082";
          ctx.beginPath(); ctx.arc(p.x + Math.cos(ang) * 28, p.y - 42 + Math.sin(ang) * 10, 6, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.restore();
    });

    // Corpses (for Gravekeeper / Trapsin visuals)
    const skNow = getSkill(currentHeroState().selectedSkillId);
    if (skNow && skNow.choreography && skNow.choreography.pattern === "corpse_chain_explosion") {
      arena.corpses.forEach((cp) => {
        if (cp.popped) return;
        const p = isoProject(cp.x, cp.y);
        ctx.fillStyle = "#7d2834";
        ctx.beginPath(); ctx.ellipse(p.x, p.y, 11, 5.5, 0, 0, Math.PI * 2); ctx.fill();
      });
    }

    // Walls (Stone obstacle + Bone/Ice/Pavise walls)
    arena.walls.forEach((w) => {
      const p = isoProject(w.x, w.y);
      ctx.fillStyle = w.kind === "ice" ? "#7cd4ff" : w.kind === "gold" ? "#ebc46c" : "#3b3548";
      ctx.strokeStyle = w.kind === "stone" ? "#74698a" : "#ffffff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(p.x - 14, p.y - 22, 28, 26, 5);
      ctx.fill(); ctx.stroke();
      if (w.permanent) {
        ctx.fillStyle = "#bfb5d4";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PILLAR", p.x, p.y - 26);
      }
    });

    // Turrets (Hydra / Sentry)
    arena.turrets.forEach((tr) => {
      const p = isoProject(tr.x, tr.y);
      ctx.fillStyle = tr.color;
      ctx.beginPath(); ctx.moveTo(p.x, p.y - 22); ctx.lineTo(p.x - 10, p.y + 4); ctx.lineTo(p.x + 10, p.y + 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(tr.kind === "sentry" ? "SENTRY" : "HYDRA", p.x, p.y - 26);
    });

    // Allies (Skeletons / Dire Wolves / Warband / Clones)
    arena.allies.forEach((al) => {
      const p = isoProject(al.x, al.y);
      ctx.fillStyle = al.color;
      ctx.beginPath(); ctx.arc(p.x, p.y - 9, 8.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.fillStyle = "#d9fbee";
      ctx.font = "bold 9px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(al.label, p.x, p.y - 21);
    });

    // Hero Aura
    const hp = isoProject(arena.hero.x, arena.hero.y);
    if (arena.hero.aura) {
      const rx = arena.hero.aura.r * 42;
      ctx.strokeStyle = arena.hero.aura.color;
      ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.ellipse(hp.x, hp.y, rx, rx * 0.5, 0, 0, Math.PI * 2); ctx.stroke();
    }

    // Hero Figure
    ctx.save();
    if (arena.hero.morph === "whirlwind") {
      ctx.strokeStyle = arena.hero.whirlColor || "#ff9f43";
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(hp.x, hp.y - 8, 34, 17, (now * 0.02) % Math.PI, 0, Math.PI * 1.65); ctx.stroke();
    }
    ctx.fillStyle = "#ebc46c";
    ctx.beginPath(); ctx.arc(hp.x, hp.y - 12, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#fff4d2"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = "#ffe49c";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    const heroLabel = arena.hero.morph && arena.hero.morph !== "whirlwind" ? arena.hero.morph.toUpperCase() : currentHero().name.toUpperCase();
    ctx.fillText(heroLabel, hp.x, hp.y - 28);
    ctx.restore();

    // Enemies
    arena.enemies.forEach((e) => {
      const p = isoProject(e.x, e.y);
      if (e.respawnTtl > 0) {
        ctx.save();
        ctx.globalAlpha = 0.42;
        ctx.strokeStyle = "#8a7060";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 4, 12, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#b89f88";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SLAYED", p.x, p.y - 12);
        ctx.restore();
        return;
      }
      const shakeX = e.flinchTtl > 0 ? Math.sin(now * 0.09) * 3.5 : 0;
      const rad = e.elite ? 13 : 9.5;
      ctx.fillStyle = e.flinchTtl > 0 ? "#fff3b0" : e.status ? "#74d4ff" : e.color;
      ctx.beginPath();
      ctx.arc(p.x + shakeX, p.y - 10, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = e.flinchTtl > 0 ? "#ffffff" : e.elite ? "#ffe082" : "#221722";
      ctx.lineWidth = e.elite ? 2.4 : 1.4;
      ctx.stroke();

      // HP Bar + Grounded HP readout
      const bw = e.elite ? 42 : 30;
      ctx.fillStyle = "#1a1423";
      ctx.fillRect(p.x - bw / 2, p.y - 29, bw, 4.5);
      ctx.fillStyle = e.elite ? "#f5c04f" : "#e05656";
      ctx.fillRect(p.x - bw / 2, p.y - 29, bw * Math.max(0, Math.min(1, e.hp / Math.max(1, e.maxHp))), 4.5);

      if (e.status) {
        ctx.fillStyle = "#fff3b0";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(e.status, p.x, p.y - 34);
      }
    });

    // Slashes / Thrusts / Leap Arcs
    arena.slashes.forEach((s) => {
      if (s.delay > 0) return;
      const p = isoProject(s.x, s.y);
      ctx.save();
      if (s.kind === "thrust" || s.kind === "giant_lance" || s.kind === "overhead_crack") {
        const p2 = isoProject(s.x + Math.cos(s.angle) * s.len, s.y + Math.sin(s.angle) * s.len);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.kind === "thrust" ? 3.5 : 8;
        ctx.beginPath(); ctx.moveTo(p.x, p.y - 10); ctx.lineTo(p2.x, p2.y - 10); ctx.stroke();
      } else if (s.kind === "ring360") {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.ellipse(p.x, p.y - 8, s.radius * 42, s.radius * 21, 0, 0, Math.PI * 2); ctx.stroke();
      } else if (s.kind === "claw_x") {
        ctx.strokeStyle = s.color; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p.x - 18, p.y - 26); ctx.lineTo(p.x + 18, p.y + 4);
        ctx.moveTo(p.x + 18, p.y - 26); ctx.lineTo(p.x - 18, p.y + 4);
        ctx.stroke();
      } else if (s.kind === "cone_wave") {
        ctx.strokeStyle = s.color; ctx.lineWidth = 4;
        const u = s.age / s.life;
        ctx.beginPath(); ctx.ellipse(p.x + u * 90, p.y - 6, 26 + u * 45, 18 + u * 24, 0, -0.9, 0.9); ctx.stroke();
      } else if (s.kind === "leap_arc" || s.kind === "dash_trail") {
        const p2 = isoProject(s.tx, s.ty);
        const u = s.age / s.life;
        const mx = (p.x + p2.x) * 0.5;
        const my = Math.min(p.y, p2.y) - (s.kind === "leap_arc" ? 75 : 12);
        const cx = (1 - u) * (1 - u) * p.x + 2 * (1 - u) * u * mx + u * u * p2.x;
        const cy = (1 - u) * (1 - u) * p.y + 2 * (1 - u) * u * my + u * u * p2.y;
        ctx.strokeStyle = s.color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p.x, p.y - 10); ctx.quadraticCurveTo(mx, my, p2.x, p2.y - 10); ctx.stroke();
        ctx.fillStyle = "#ffe49c";
        ctx.beginPath(); ctx.arc(cx, cy - 10, 9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });

    // Beams
    arena.beams.forEach((b) => {
      const p1 = isoProject(b.x1, b.y1);
      const p2 = b.target ? isoProject(b.target.x, b.target.y) : isoProject(b.x2, b.y2);
      ctx.save();
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.kind === "rail" ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y - 12); ctx.lineTo(p2.x, p2.y - 12); ctx.stroke();
      if (b.kind === "siphon") {
        const t = 1 - ((now * 0.003) % 1);
        const ox = p1.x + (p2.x - p1.x) * t;
        const oy = p1.y + (p2.y - p1.y) * t - 12;
        ctx.fillStyle = b.color2 || "#fff";
        ctx.beginPath(); ctx.arc(ox, oy, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });

    // Projectiles
    arena.projectiles.forEach((pr) => {
      const p = isoProject(pr.x, pr.y);
      ctx.fillStyle = pr.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 10, pr.boulder ? 13 : pr.shardEmitter ? 10 : 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    // Floating combat labels
    arena.floaters.forEach((f) => {
      const p = isoProject(f.x, f.y);
      const u = f.age / f.life;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - u);
      ctx.fillStyle = f.color;
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, p.x, p.y - 26 - u * 24);
      ctx.restore();
    });
  }

  // ==========================================================================
  // 8. HERO WIZARD MODAL (BLANK OR CLONE ANY HERO + 36 PORTRAITS + EDIT MODE)
  // ==========================================================================
  function populateWizardPortraitGrid() {
    const grid = document.getElementById("hwPortraitGrid");
    if (!grid) return;
    const portraits = getPortraitCatalog();
    grid.innerHTML = portraits
      .map((p) => {
        const active = wizardCtx.selectedPortrait === p.path ? "active" : "";
        return `
          <button type="button" class="portrait-choice ${active}" data-hw-portrait="${esc(p.path)}" title="${esc(
          p.label
        )}">
            <img src="${esc(p.path)}" alt="${esc(p.label)}" loading="lazy" />
          </button>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-hw-portrait]").forEach((btn) => {
      btn.addEventListener("click", () => {
        wizardCtx.selectedPortrait = btn.dataset.hwPortrait;
        grid.querySelectorAll(".portrait-choice").forEach((el) => {
          el.classList.toggle("active", el.dataset.hwPortrait === wizardCtx.selectedPortrait);
        });
      });
    });
  }

  function applyWizardTemplateFields(tplVal) {
    if (tplVal === "blank") {
      const customCount = (state.customHeroes || []).length + 1;
      document.getElementById("hwName").value = `Custom Outrider ${customCount}`;
      document.getElementById("hwTitle").value = "Custom Three-Tree Archetype";
      document.getElementById("hwIdentity").value =
        "Custom isometric ARPG build combining hand-picked skills across 3 combat trees plus Universal Mobility and Warband command.";
      wizardCtx.selectedPortrait = "assets/portraits/rogueicon.png";
      document.getElementById("hwTree1Name").value = "Primary Arms";
      document.getElementById("hwTree1Weap").value = "Melee / Polearm";
      document.getElementById("hwTree2Name").value = "Ranged & Tactical";
      document.getElementById("hwTree2Weap").value = "Bow / Thrown";
      document.getElementById("hwTree3Name").value = "Arcane & Gadgets";
      document.getElementById("hwTree3Weap").value = "Focus / Traps";
      populateWizardPortraitGrid();
      return;
    }

    const srcId = tplVal.replace(/^clone:/, "");
    const src = allHeroes().find((h) => h.id === srcId) || DATA.heroes[0];
    const meta = getHeroDisplayMeta(src);
    document.getElementById("hwName").value = `${meta.name} (Copy)`;
    document.getElementById("hwTitle").value = meta.title;
    document.getElementById("hwIdentity").value = meta.combatIdentity;
    wizardCtx.selectedPortrait = meta.portrait;
    [0, 1, 2].forEach((i) => {
      document.getElementById(`hwTree${i + 1}Name`).value = meta.trees[i].name;
      document.getElementById(`hwTree${i + 1}Weap`).value = meta.trees[i].weaponFocus;
    });
    populateWizardPortraitGrid();
  }

  function openHeroWizard(mode, editHeroId, focusFieldId) {
    const modal = document.getElementById("heroWizardModal");
    if (!modal) return;

    wizardCtx.mode = mode || "create";
    wizardCtx.editHeroId = editHeroId || currentHero().id;

    const tplRow = document.getElementById("heroTemplateRow");
    const tplSel = document.getElementById("hwTemplateSelect");
    const titleEl = document.getElementById("heroModalTitle");
    const subEl = document.getElementById("heroModalSub");
    const saveBtn = document.getElementById("btnSaveHeroWizard");

    if (tplSel) {
      const opts = [
        `<option value="blank">🧹 Blank Custom Hero (Empty 3×4 Trees — Build From Scratch)</option>`,
        ...allHeroes().map((h) => {
          const hm = getHeroDisplayMeta(h);
          return `<option value="clone:${esc(h.id)}">📋 Clone ${esc(hm.name)} (Keep All 3 Trees &amp; Freely Rip/Swap)</option>`;
        }),
      ];
      tplSel.innerHTML = opts.join("");
    }

    if (wizardCtx.mode === "edit") {
      const targetHero = allHeroes().find((h) => h.id === wizardCtx.editHeroId) || currentHero();
      const meta = getHeroDisplayMeta(targetHero);
      if (tplRow) tplRow.classList.add("hidden");
      if (titleEl) titleEl.textContent = `✏️ Edit Hero & Trees — ${meta.name}`;
      if (subEl) subEl.textContent = "Rename your hero, swap portrait art, or rename any of the 3 class combat trees.";
      if (saveBtn) saveBtn.textContent = "💾 Save Hero Changes";

      document.getElementById("hwName").value = meta.name;
      document.getElementById("hwTitle").value = meta.title;
      document.getElementById("hwIdentity").value = meta.combatIdentity;
      wizardCtx.selectedPortrait = meta.portrait;
      [0, 1, 2].forEach((i) => {
        document.getElementById(`hwTree${i + 1}Name`).value = meta.trees[i].name;
        document.getElementById(`hwTree${i + 1}Weap`).value = meta.trees[i].weaponFocus;
      });
      populateWizardPortraitGrid();
    } else {
      if (tplRow) tplRow.classList.remove("hidden");
      if (titleEl) titleEl.textContent = "✨ Character Forge — Create or Clone Hero";
      if (subEl) {
        subEl.textContent =
          "Start a clean 3×4 blank slate OR clone any hero with all 3 trees pre-slotted so you can rip, swap, and customize.";
      }
      if (saveBtn) saveBtn.textContent = "💾 Create & Open Hero";
      if (tplSel) tplSel.value = "blank";
      applyWizardTemplateFields("blank");
    }

    modal.classList.remove("hidden");
    const toFocus = document.getElementById(focusFieldId || "hwName");
    if (toFocus) {
      setTimeout(() => {
        toFocus.focus();
        if (toFocus.select) toFocus.select();
      }, 20);
    }
  }

  function saveHeroWizardForm() {
    const name = document.getElementById("hwName").value.trim() || "Custom Hero";
    const title = document.getElementById("hwTitle").value.trim() || "Custom Archetype";
    const combatIdentity =
      document.getElementById("hwIdentity").value.trim() ||
      "Custom isometric ARPG build combining active combat trees with Mobility and Warband synergies.";
    const portrait = wizardCtx.selectedPortrait || "assets/portraits/amazonicon.png";
    const treeDefs = [0, 1, 2].map((i) => ({
      name: document.getElementById(`hwTree${i + 1}Name`).value.trim() || `Combat Tree ${i + 1}`,
      weaponFocus: document.getElementById(`hwTree${i + 1}Weap`).value.trim() || "Mixed Arms",
      theme: "Custom forged combat discipline",
    }));

    if (wizardCtx.mode === "edit") {
      const targetHero = allHeroes().find((h) => h.id === wizardCtx.editHeroId) || currentHero();
      pushUndoSnapshot();
      if (targetHero.isCustom) {
        targetHero.name = name;
        targetHero.title = title;
        targetHero.combatIdentity = combatIdentity;
        targetHero.portrait = portrait;
        targetHero.classTrees = [0, 1, 2].map((i) => ({
          ...(targetHero.classTrees && targetHero.classTrees[i]),
          treeNumber: i + 1,
          id: `${targetHero.id}_t${i + 1}`,
          name: treeDefs[i].name,
          weaponFocus: treeDefs[i].weaponFocus,
          theme: (targetHero.classTrees && targetHero.classTrees[i] && targetHero.classTrees[i].theme) || treeDefs[i].theme,
          skills: (targetHero.classTrees && targetHero.classTrees[i] && targetHero.classTrees[i].skills) || [],
        }));
      } else {
        const hs = ensureHeroStateShape(targetHero, state.heroStates[targetHero.id]);
        hs.heroMetaOverride = { name, title, portrait, combatIdentity };
        hs.treeMetaOverrides = treeDefs;
        state.heroStates[targetHero.id] = hs;
      }
      document.getElementById("heroWizardModal").classList.add("hidden");
      saveState();
      renderAll();
      showToast(`💾 Updated "${name}"`);
      return;
    }

    const tplVal = document.getElementById("hwTemplateSelect").value || "blank";
    document.getElementById("heroWizardModal").classList.add("hidden");

    if (tplVal.startsWith("clone:")) {
      const srcId = tplVal.replace(/^clone:/, "");
      cloneHeroById(srcId, {
        name,
        title,
        portrait,
        combatIdentity,
        trees: treeDefs,
      });
      return;
    }

    // Create brand-new Blank Hero with empty 3x4 class trees
    pushUndoSnapshot();
    const id = `custom_hero_${Date.now()}`;
    const newHero = {
      id,
      isCustom: true,
      name,
      title,
      portrait,
      d2Slot: "Custom Blank",
      combatIdentity,
      classTrees: [0, 1, 2].map((i) => ({
        treeNumber: i + 1,
        id: `${id}_t${i + 1}`,
        name: treeDefs[i].name,
        weaponFocus: treeDefs[i].weaponFocus,
        theme: treeDefs[i].theme,
        skills: [],
      })),
      presets: [],
    };
    state.customHeroes.push(newHero);
    state.heroStates[id] = ensureHeroStateShape(newHero, {
      heroId: id,
      presetId: "",
      activeTab: "tree1",
      selectedSkillId: DATA.skillLibrary[0].id,
      treeGrid: [{}, {}, {}],
      prereqByTree: [{}, {}, {}],
      heroMetaOverride: null,
      treeMetaOverrides: null,
      ranks: { mob_second_wind: 1, cmd_mercenary_levy: 1 },
    });
    state.activeHeroId = id;
    state.activeMode = "trees";
    targetSlot = { treeIdx: 0, tier: 1, col: 0 };
    if (state.paletteCollapsed) state.paletteCollapsed = false;

    saveState();
    syncWorkspaceLayout();
    renderAll();
    showToast(`✨ Created "${name}" — click or drag skills from the left palette to fill Tree 1!`);
  }

  // ==========================================================================
  // 9. NODE & SKILL EDITOR MODAL (SAVE, FORK COPY, RIP, CREATE & 355 ICONS)
  // ==========================================================================
  function ensurePatternSelectPopulated() {
    const sel = document.getElementById("nePattern");
    if (!sel || sel.options.length > 0) return;
    sel.innerHTML = CHOREO_PATTERNS.map((p) => `<option value="${esc(p.id)}">${esc(p.label)}</option>`).join("");
  }

  function ensureIconGroupSelectPopulated() {
    const grpSel = document.getElementById("neIconGroup");
    if (!grpSel) return;
    const icons = getIconCatalog();
    const groups = Array.from(new Set(icons.map((ic) => ic.group || "Other"))).sort();
    const prev = grpSel.value || "ALL";
    grpSel.innerHTML =
      `<option value="ALL">All Icon Groups (${icons.length})</option>` +
      groups.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join("");
    if (groups.includes(prev)) grpSel.value = prev;
  }

  function renderNodeEditorIconGrid() {
    const grid = document.getElementById("neIconGrid");
    if (!grid) return;
    const q = (document.getElementById("neIconSearch").value || "").trim().toLowerCase();
    const grp = document.getElementById("neIconGroup").value || "ALL";
    const icons = getIconCatalog().filter((ic) => {
      if (grp !== "ALL" && ic.group !== grp) return false;
      if (q) {
        const hay = `${ic.label || ""} ${ic.id || ""} ${ic.group || ""} ${ic.path || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    grid.innerHTML = icons
      .map((ic) => {
        const active = nodeEditorCtx.selectedIcon === ic.path ? "active" : "";
        return `
          <button type="button" class="icon-choice ${active}" data-ne-icon="${esc(ic.path)}" title="${esc(
          `${ic.label} (${ic.group})`
        )}">
            <img src="${esc(ic.path)}" alt="${esc(ic.label)}" loading="lazy" />
          </button>
        `;
      })
      .join("");

    grid.querySelectorAll("[data-ne-icon]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setNodeEditorSelectedIcon(btn.dataset.neIcon);
      });
    });
  }

  function setNodeEditorSelectedIcon(iconPath) {
    nodeEditorCtx.selectedIcon = iconPath || "assets/icons/d2r/ama_jab.png";
    const img = document.getElementById("neSelectedIconImg");
    const lbl = document.getElementById("neSelectedIconPath");
    if (img) img.src = nodeEditorCtx.selectedIcon;
    if (lbl) {
      const hit = getIconCatalog().find((x) => x.path === nodeEditorCtx.selectedIcon);
      lbl.textContent = hit
        ? `${hit.label} (${hit.group})`
        : nodeEditorCtx.selectedIcon.startsWith("data:")
        ? "Bundled HD Skill Icon"
        : nodeEditorCtx.selectedIcon;
    }
    const grid = document.getElementById("neIconGrid");
    if (grid) {
      grid.querySelectorAll(".icon-choice").forEach((el) => {
        el.classList.toggle("active", el.dataset.neIcon === nodeEditorCtx.selectedIcon);
      });
    }
  }

  function populateNodeEditorPrereqOptions(treeIdx, currentSkillId, selectedPrereqId) {
    const sel = document.getElementById("nePrereq");
    if (!sel) return;
    const hs = currentHeroState();
    const cells = (hs.treeGrid && hs.treeGrid[treeIdx]) || {};
    const options = [`<option value="">None (No Prerequisite Arrow)</option>`];

    Object.entries(cells)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([key, sid]) => {
        if (!sid || sid === currentSkillId) return;
        const [tStr, cStr] = key.split("_");
        const tierNum = parseInt(tStr, 10);
        const colNum = parseInt(cStr, 10);
        const other = getSkill(sid);
        const selAttr = sid === selectedPrereqId ? "selected" : "";
        options.push(
          `<option value="${esc(sid)}" ${selAttr}>Tier ${TIER_META[tierNum - 1].roman} (Col ${colNum + 1}): ${esc(
            other.name
          )}</option>`
        );
      });

    sel.innerHTML = options.join("");
    sel.value = selectedPrereqId && options.some((o) => o.includes(`value="${esc(selectedPrereqId)}"`)) ? selectedPrereqId : "";
  }

  function fillNodeEditorFormFromSkill(sk, tierVal, colVal, treeIdx, prereqVal) {
    ensurePatternSelectPopulated();
    ensureIconGroupSelectPopulated();

    document.getElementById("neName").value = sk.name || "";
    const castSel = document.getElementById("neCastType");
    const castVal = sk.castType || "Active";
    if (!Array.from(castSel.options).some((o) => o.value === castVal)) {
      const opt = document.createElement("option");
      opt.value = castVal;
      opt.textContent = castVal;
      castSel.appendChild(opt);
    }
    castSel.value = castVal;

    document.getElementById("neTier").value = String(Math.min(4, Math.max(1, tierVal || sk.tier || 1)));
    document.getElementById("neCol").value = String(Math.min(2, Math.max(0, typeof colVal === "number" ? colVal : 1)));
    document.getElementById("neMaxRank").value = String(sk.maxRank || 20);
    document.getElementById("neCooldown").value = sk.cooldown || "";
    document.getElementById("neResource").value = sk.resource || "";
    document.getElementById("neEffects").value = (sk.effects || []).join(", ");

    const ch = sk.choreography || {};
    const patSel = document.getElementById("nePattern");
    const patVal = ch.pattern || "rapid_jab_3";
    if (!Array.from(patSel.options).some((o) => o.value === patVal)) {
      const opt = document.createElement("option");
      opt.value = patVal;
      opt.textContent = patVal;
      patSel.appendChild(opt);
    }
    patSel.value = patVal;

    document.getElementById("neColor1").value = /^#[0-9a-fA-F]{6}$/.test(ch.color1 || "") ? ch.color1 : "#67c4ff";
    document.getElementById("neColor2").value = /^#[0-9a-fA-F]{6}$/.test(ch.color2 || "") ? ch.color2 : "#ffe07d";
    document.getElementById("neCount").value = String(ch.count || 6);
    document.getElementById("neRadius").value = String(ch.radius || 2.0);
    document.getElementById("neHitStatus").value = ch.hitStatus || "HIT!";

    document.getElementById("neSimilar").value = sk.origGameSkillName || sk.similarTo || "";
    document.getElementById("neOrigHow").value = sk.origHowItWorked || "";
    document.getElementById("neMechanic").value = sk.bcExactInteraction || sk.mechanic || "";
    document.getElementById("neSynergy").value = sk.hybridHook || sk.staminaRule || "";

    populateNodeEditorPrereqOptions(treeIdx, sk.id, prereqVal || "");

    document.getElementById("neIconSearch").value = "";
    document.getElementById("neIconGroup").value = "ALL";
    setNodeEditorSelectedIcon(sk.icon || "assets/icons/d2r/ama_jab.png");
    renderNodeEditorIconGrid();
  }

  function openNodeEditorForCell(treeIdx, cellKey) {
    const hs = currentHeroState();
    const cells = (hs.treeGrid && hs.treeGrid[treeIdx]) || {};
    const sid = cells[cellKey];
    if (!sid) return;
    const sk = getSkill(sid);
    const [tStr, cStr] = cellKey.split("_");
    const tier = parseInt(tStr, 10);
    const col = parseInt(cStr, 10);
    const def = { isUniversal: false, treeIdx, cells };
    const prereqVal = getEffectivePrereq(hs, def, sid);

    nodeEditorCtx = {
      mode: "slot",
      treeIdx,
      tier,
      col,
      skillId: sid,
      selectedIcon: sk.icon || "assets/icons/d2r/ama_jab.png",
    };

    document.getElementById("nodeEditorTitle").textContent = `✏️ Edit Tree Node — ${sk.name}`;
    document.getElementById("nodeEditorSub").textContent = `Tree ${treeIdx + 1} · Tier ${
      TIER_META[tier - 1].roman
    }, Col ${col + 1} — Save in-place or Fork an independent custom skill copy.`;
    document.getElementById("btnDeleteNodeInModal").classList.remove("hidden");
    document.getElementById("btnForkNodeSkill").classList.remove("hidden");
    document.getElementById("btnSaveNodeSkill").textContent = "💾 Save Changes";

    fillNodeEditorFormFromSkill(sk, tier, col, treeIdx, prereqVal);
    document.getElementById("nodeEditorModal").classList.remove("hidden");
  }

  function openNodeEditorForSkill(skillId) {
    const hero = currentHero();
    const hs = currentHeroState();
    const cellHit = findCellOfSkillInActiveTree(hero, hs, skillId);
    if (cellHit) {
      openNodeEditorForCell(cellHit.treeIdx, cellHit.key);
      return;
    }

    const sk = getSkill(skillId);
    const treeIdx = getActiveClassTreeIndex(hs);
    nodeEditorCtx = {
      mode: "skill",
      treeIdx,
      tier: Math.min(4, Math.max(1, sk.tier || 1)),
      col: typeof sk.col === "number" ? Math.min(2, Math.max(0, sk.col)) : 1,
      skillId: sk.id,
      selectedIcon: sk.icon || "assets/icons/d2r/ama_jab.png",
    };

    document.getElementById("nodeEditorTitle").textContent = `✏️ Edit Codex Skill — ${sk.name}`;
    document.getElementById("nodeEditorSub").textContent =
      "Save edits across the library OR Fork a custom copy directly into your active hero's skill tree.";
    document.getElementById("btnDeleteNodeInModal").classList.add("hidden");
    document.getElementById("btnForkNodeSkill").classList.remove("hidden");
    document.getElementById("btnSaveNodeSkill").textContent = "💾 Save Skill Changes";

    fillNodeEditorFormFromSkill(sk, nodeEditorCtx.tier, nodeEditorCtx.col, treeIdx, sk.prereq || "");
    document.getElementById("nodeEditorModal").classList.remove("hidden");
  }

  function openNodeEditorForCreate() {
    const hs = currentHeroState();
    const heroMeta = getHeroDisplayMeta(currentHero());
    const treeIdx = targetSlot ? targetSlot.treeIdx : getActiveClassTreeIndex(hs);
    const tier = targetSlot ? targetSlot.tier : 2;
    const col = targetSlot ? targetSlot.col : 1;
    const defaultIcon = "assets/icons/d2r/ama_lightning_fury.png";

    nodeEditorCtx = {
      mode: "create",
      treeIdx,
      tier,
      col,
      skillId: null,
      selectedIcon: defaultIcon,
    };

    document.getElementById("nodeEditorTitle").textContent = "✨ Author Brand-New Skill";
    document.getElementById("nodeEditorSub").textContent = `Choose any of the 355 HD icons & 54 live isometric cast patterns — slots straight into ${heroMeta.name}.`;
    document.getElementById("btnDeleteNodeInModal").classList.add("hidden");
    document.getElementById("btnForkNodeSkill").classList.add("hidden");
    document.getElementById("btnSaveNodeSkill").textContent = "✨ Create & Slot Skill";

    fillNodeEditorFormFromSkill(
      {
        id: "",
        name: "Arcane Tempest",
        castType: "Skillshot",
        tier,
        col,
        maxRank: 20,
        cooldown: "4.0s",
        resource: "14 Stamina",
        effects: ["AoE", "Shock", "Pierce"],
        origGameSkillName: "Diablo II Lightning Fury / PoE 2 Spear",
        origHowItWorked: "Hurls a charged projectile that splits into chaining bolts across nearby packs.",
        bcExactInteraction:
          "Fires a fast-tempo piercing skillshot that detonates on impact and releases splitting shock bolts across surrounding enemies.",
        hybridHook: "Combos cleanly with pull hooks, freeze zones, and Warband frontline pinning.",
        icon: defaultIcon,
        choreography: {
          pattern: "javelin_split_bolts",
          color1: "#67c4ff",
          color2: "#ffe07d",
          count: 7,
          radius: 2.2,
          hitStatus: "SHOCKED!",
        },
      },
      tier,
      col,
      treeIdx,
      ""
    );
    document.getElementById("nodeEditorModal").classList.remove("hidden");
    setTimeout(() => {
      const nm = document.getElementById("neName");
      if (nm) {
        nm.focus();
        nm.select();
      }
    }, 20);
  }

  function collectSkillFromNodeEditor(baseSkill, targetId) {
    const heroMeta = getHeroDisplayMeta(currentHero());
    const name = document.getElementById("neName").value.trim() || "Custom Skill";
    const castType = document.getElementById("neCastType").value || "Active";
    const tier = Math.min(4, Math.max(1, parseInt(document.getElementById("neTier").value, 10) || 1));
    const col = Math.min(2, Math.max(0, parseInt(document.getElementById("neCol").value, 10) || 0));
    const prereq = document.getElementById("nePrereq").value || "";
    const maxRank = Math.min(30, Math.max(1, parseInt(document.getElementById("neMaxRank").value, 10) || 20));
    const cooldown = document.getElementById("neCooldown").value.trim();
    const resource = document.getElementById("neResource").value.trim();
    const effects = document
      .getElementById("neEffects")
      .value.split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const pattern = document.getElementById("nePattern").value || "rapid_jab_3";
    const color1 = document.getElementById("neColor1").value || "#67c4ff";
    const color2 = document.getElementById("neColor2").value || "#ffe07d";
    const count = Math.min(24, Math.max(1, parseInt(document.getElementById("neCount").value, 10) || 6));
    const radiusEl = document.getElementById("neRadius");
    const radius = Math.min(6, Math.max(0.5, parseFloat(radiusEl ? radiusEl.value : "2.0") || 2.0));
    const hitStatus = document.getElementById("neHitStatus").value.trim() || "HIT!";

    const origSkill = document.getElementById("neSimilar").value.trim() || "Custom ARPG Inspiration";
    const origHow = document.getElementById("neOrigHow").value.trim() || `Inspired by ${origSkill}.`;
    const bcInteraction =
      document.getElementById("neMechanic").value.trim() || "Custom Blood Crown active combat skill.";
    const synergy = document.getElementById("neSynergy").value.trim();
    const icon = nodeEditorCtx.selectedIcon || (baseSkill && baseSkill.icon) || "assets/icons/d2r/ama_jab.png";

    return {
      skillObj: {
        ...(baseSkill || {}),
        id: targetId,
        name,
        castType,
        tier,
        col,
        prereq: prereq || null,
        maxRank,
        cooldown,
        resource,
        effects,
        similarTo: origSkill,
        origGameSkillName: origSkill,
        origHowItWorked: origHow,
        bcExactInteraction: bcInteraction,
        mechanic: bcInteraction,
        hybridHook: synergy,
        originHero: (baseSkill && baseSkill.originHero) || heroMeta.name,
        icon,
        refIcons: [{ game: shortOriginTag({ similarTo: origSkill, id: targetId }), skillName: origSkill, icon }],
        choreography: {
          ...((baseSkill && baseSkill.choreography) || {}),
          pattern,
          color1,
          color2,
          count,
          radius,
          hitStatus,
        },
      },
      tier,
      col,
      prereq,
    };
  }

  function saveNodeEditor(asForkCopy) {
    const hs = currentHeroState();
    const isCreate = nodeEditorCtx.mode === "create";
    const shouldMintNewId = isCreate || Boolean(asForkCopy);
    const oldId = nodeEditorCtx.skillId;
    const baseSk = oldId ? getSkill(oldId) : null;
    const finalId = shouldMintNewId ? `custom_sk_${Date.now()}` : oldId;

    pushUndoSnapshot();

    const { skillObj, tier, col, prereq } = collectSkillFromNodeEditor(baseSk, finalId);
    if (asForkCopy && baseSk && skillObj.name === baseSk.name) {
      skillObj.name = `${skillObj.name} (Custom)`;
    }

    state.customSkills[finalId] = skillObj;
    rebuildSkillMap();

    const treeIdx = nodeEditorCtx.treeIdx;
    if (nodeEditorCtx.mode === "slot" || isCreate || asForkCopy) {
      hs.activeTab = `tree${treeIdx + 1}`;
      const cells = hs.treeGrid[treeIdx];
      const oldCellKey = `${nodeEditorCtx.tier}_${nodeEditorCtx.col}`;
      const newCellKey = `${tier}_${col}`;

      if (nodeEditorCtx.mode === "slot" && oldCellKey !== newCellKey) {
        const displaced = cells[newCellKey];
        delete cells[oldCellKey];
        if (displaced && displaced !== oldId) {
          cells[oldCellKey] = displaced;
        }
      }

      // Ensure 1-to-1 uniqueness in tree
      Object.keys(cells).forEach((k) => {
        if (cells[k] === finalId && k !== newCellKey) delete cells[k];
      });
      cells[newCellKey] = finalId;

      if (!hs.prereqByTree) hs.prereqByTree = [{}, {}, {}];
      hs.prereqByTree[treeIdx][finalId] = prereq || "";

      // If we forked a slotted node, preserve downstream arrows pointing to this slot
      if (asForkCopy && oldId && oldId !== finalId) {
        Object.keys(hs.prereqByTree[treeIdx]).forEach((sidKey) => {
          if (hs.prereqByTree[treeIdx][sidKey] === oldId) {
            hs.prereqByTree[treeIdx][sidKey] = finalId;
          }
        });
        hs.ranks[finalId] = Math.max(1, hs.ranks[oldId] || 1);
      } else {
        hs.ranks[finalId] = Math.max(1, hs.ranks[finalId] || 1);
      }
    }

    hs.selectedSkillId = finalId;
    targetSlot = null;
    document.getElementById("nodeEditorModal").classList.add("hidden");

    if (isCreate || asForkCopy) {
      state.activeMode = "trees";
      syncWorkspaceLayout();
    }

    reconcileHeroBuilds(currentHero(), hs);
    saveState();
    renderAll();
    triggerSkillPreview(finalId, true);
    showToast(
      isCreate
        ? `✨ Created & slotted "${skillObj.name}"`
        : asForkCopy
        ? `📋 Forked independent skill "${skillObj.name}"`
        : `💾 Saved "${skillObj.name}"`
    );
  }

  // ==========================================================================
  // 10. BACKUP / JSON EXPORT / SHAREABLE URL (#share=<base64url>)
  // ==========================================================================
  function encodeBase64UrlUtf8(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodeBase64UrlUtf8(b64url) {
    let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function buildPortableExportPayload() {
    return {
      app: "blood-crown-skill-forge",
      version: 6,
      updatedAt: Date.now(),
      activeHeroId: state.activeHeroId,
      activeMode: normalizeMode(state.activeMode),
      customHeroes: state.customHeroes,
      customSkills: state.customSkills,
      heroStates: state.heroStates,
    };
  }

  function openDataModal() {
    const modal = document.getElementById("dataModal");
    const area = document.getElementById("jsonExportArea");
    if (area) {
      area.value = JSON.stringify(buildPortableExportPayload(), null, 2);
    }
    if (modal) modal.classList.remove("hidden");
  }

  function importPortablePayload(parsed) {
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON object");
    }
    pushUndoSnapshot();
    const next = hydrateStateObject({
      ...state,
      activeHeroId: parsed.activeHeroId || state.activeHeroId,
      activeMode: normalizeMode(parsed.activeMode || state.activeMode),
      customHeroes: parsed.customHeroes || [],
      customSkills: parsed.customSkills || {},
      heroStates: parsed.heroStates || {},
    });
    state = next;
    rebuildSkillMap();
    targetSlot = null;
    saveState();
    renderAll();
    triggerSkillPreview(currentHeroState().selectedSkillId, true);
  }

  function buildActiveHeroShareUrl() {
    const hero = currentHero();
    const hs = currentHeroState();
    const referencedCustomSkills = {};
    (hs.treeGrid || []).forEach((cells) => {
      Object.values(cells || {}).forEach((sid) => {
        if (state.customSkills[sid]) {
          referencedCustomSkills[sid] = state.customSkills[sid];
        }
      });
    });
    const shareObj = {
      v: 6,
      mode: normalizeMode(state.activeMode),
      hero: hero.isCustom ? hero : null,
      heroId: hero.id,
      heroState: hs,
      customSkills: referencedCustomSkills,
    };
    const encoded = encodeBase64UrlUtf8(shareObj);
    const base = `${window.location.origin}${window.location.pathname}`;
    return `${base}#share=${encoded}`;
  }

  function hydrateUrlParameters() {
    let importedSharedBuild = false;
    try {
      const hash = window.location.hash || "";
      if (hash.startsWith("#share=")) {
        const raw = hash.slice("#share=".length);
        const shared = decodeBase64UrlUtf8(raw);
        if (shared && shared.heroState) {
          if (shared.customSkills) {
            Object.assign(state.customSkills, normalizeCustomSkillsMap(shared.customSkills));
            rebuildSkillMap();
          }
          let targetHeroId = shared.heroId || DATA.heroes[0].id;
          if (shared.hero && shared.hero.isCustom) {
            const newId = state.customHeroes.some((h) => h.id === shared.hero.id)
              ? `shared_hero_${Date.now()}`
              : shared.hero.id;
            const importedHero = { ...shared.hero, id: newId, isCustom: true };
            state.customHeroes.push(importedHero);
            targetHeroId = newId;
            state.heroStates[newId] = ensureHeroStateShape(importedHero, {
              ...shared.heroState,
              heroId: newId,
            });
          } else {
            const baseH = DATA.heroes.find((h) => h.id === targetHeroId) || DATA.heroes[0];
            targetHeroId = baseH.id;
            state.heroStates[targetHeroId] = ensureHeroStateShape(baseH, shared.heroState);
          }
          state.activeHeroId = targetHeroId;
          state.activeMode = normalizeMode(shared.mode || (shared.heroState.builds ? "builds" : "trees"));
          importedSharedBuild = true;
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
          saveState();
          setTimeout(() => showToast("🔗 Loaded shared Blood Crown hero & builds from URL!"), 120);
        }
      }

      const params = new URLSearchParams(window.location.search || "");
      const qMode = params.get("mode");
      if (qMode === "codex" || qMode === "builds" || qMode === "trees" || qMode === "studio" || qMode === "matrix") {
        state.activeMode = normalizeMode(qMode);
        if (qMode === "builds") state.mobileTab = "builds";
        else if (qMode === "codex") state.mobileTab = "skills";
        else if (qMode === "matrix") state.mobileTab = "matrix";
      }
      const qTab = params.get("tab");
      if (qTab) {
        state.mobileTab = normalizeMobileTab(qTab);
      }
      if (params.get("action") === "new-hero") {
        state.activeMode = "trees";
        state.mobileTab = "heroes";
        setTimeout(() => openHeroWizard("create"), 60);
      }
    } catch (_e) {}
    return importedSharedBuild;
  }

  // ==========================================================================
  // 11. WORKSPACE LAYOUT, MOBILE SPA ROUTING, PWA SW & GLOBAL EVENT BINDINGS
  // ==========================================================================
  function renderMobileChrome() {
    const hero = currentHero();
    const hs = currentHeroState();
    const meta = getHeroDisplayMeta(hero);
    const mode = normalizeMode(state.activeMode);
    const isBuilds = mode === "builds";
    const activeBuild = currentActiveBuild();
    const mTab = normalizeMobileTab(state.mobileTab);
    state.mobileTab = mTab;
    document.body.dataset.mobileTab = mTab;

    const av = document.getElementById("mobHeroAvatar");
    const nm = document.getElementById("mobHeroName");
    const sub = document.getElementById("mobHeroSub");
    if (av) av.src = meta.portrait;
    if (nm) nm.textContent = meta.name;
    if (sub) {
      sub.textContent = isBuilds
        ? `${activeBuild.name} · ${totalBuildPoints(activeBuild)}/${MAX_SKILL_POINTS} pts`
        : `${meta.title || "Kit Architect"} · 3 Trees`;
    }

    const bTrees = document.getElementById("btnMobileModeTrees");
    const bBuilds = document.getElementById("btnMobileModeBuilds");
    if (bTrees) bTrees.classList.toggle("active", !isBuilds);
    if (bBuilds) bBuilds.classList.toggle("active", isBuilds);

    const navBadge = document.getElementById("mobNavBuildsBadge");
    if (navBadge) navBadge.textContent = `${(hs.builds || []).length}`;

    document.querySelectorAll("[data-mob-tab]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mobTab === mTab);
    });
  }

  function renderMobileTreeActionDock() {
    const dock = document.getElementById("mobileTreeActionDock");
    if (!dock) return;

    const hero = currentHero();
    const hs = currentHeroState();
    const def = getActiveTreeDefinition(hero, hs);
    const isBuilds = normalizeMode(state.activeMode) === "builds";
    const activeBuild = currentActiveBuild();

    if (!isBuilds && targetSlot && targetSlot.treeIdx === def.treeIdx) {
      dock.innerHTML = `
        <div class="mob-dock-top">
          <div class="mob-dock-info">
            <div class="mob-dock-title">🎯 Slot Selected: Tier ${TIER_META[targetSlot.tier - 1].roman} · Col ${targetSlot.col + 1}</div>
            <div class="mob-dock-sub">Pick any of the 138 skills to place in this slot</div>
          </div>
        </div>
        <div class="mob-dock-btns">
          <button type="button" class="btn btn-gold" id="mobDockOpenSkillsBtn">📚 Pick Skill</button>
          <button type="button" class="btn btn-outline" id="mobDockCancelSlotBtn">Cancel</button>
        </div>
      `;
      const pBtn = document.getElementById("mobDockOpenSkillsBtn");
      if (pBtn) pBtn.addEventListener("click", () => setMobileTab("skills"));
      const cBtn = document.getElementById("mobDockCancelSlotBtn");
      if (cBtn) cBtn.addEventListener("click", () => setTargetSlot(null));
      return;
    }

    const sk = getSkill(hs.selectedSkillId);
    const hitInTree = !def.isUniversal ? findCellOfSkillInActiveTree(hero, hs, sk.id) : null;
    const activeMod = getActiveSkillModifierForBuild(sk.id, activeBuild);
    const mechText = sk.bcExactInteraction || sk.mechanic || "";
    const shortMech = mechText.length > 96 ? `${mechText.slice(0, 94)}…` : mechText;

    const detailsDrawerHtml = mobDockDetailsOpen
      ? `
        <div class="mob-dock-details-drawer">
          <div class="mob-dock-detail-line"><strong>Mechanic:</strong> ${esc(mechText)}</div>
          ${sk.cooldown || sk.cost ? `<div class="mob-dock-detail-meta">${sk.cooldown ? `⏱ ${esc(sk.cooldown)}` : ""} ${sk.cost ? `· 💧 ${esc(sk.cost)}` : ""}</div>` : ""}
          ${activeMod ? `<div class="mob-dock-detail-mod">⚡ <strong>${esc(activeMod.name)}:</strong> ${esc(activeMod.behaviorChange)}</div>` : ""}
        </div>
      `
      : `<div class="mob-dock-mech-preview">${esc(shortMech)}</div>`;

    if (isBuilds) {
      const rk = activeBuild.ranks[sk.id] || 0;
      const maxR = sk.maxRank || 20;
      const pts = totalBuildPoints(activeBuild);
      const inCombo = (activeBuild.rotation || []).some((r) => r && r.skillId === sk.id);
      dock.innerHTML = `
        <div class="mob-dock-top">
          <img src="${esc(sk.icon)}" alt="${esc(sk.name)}" />
          <div class="mob-dock-info">
            <div class="mob-dock-title">${esc(sk.name)}${activeMod ? ` <span class="mob-dock-mod-tag">⚡</span>` : ""}</div>
            <div class="mob-dock-sub">Rank ${rk}/${maxR} · Build: ${pts}/${MAX_SKILL_POINTS} pts</div>
          </div>
          <button type="button" class="btn btn-xs btn-outline mob-dock-info-toggle" id="mobDockToggleInfo">${mobDockDetailsOpen ? "Hide" : "📖 Info"}</button>
        </div>
        ${detailsDrawerHtml}
        <div class="mob-dock-btns">
          <button type="button" class="btn btn-outline" id="mobDockSub1">−1</button>
          <button type="button" class="btn btn-emerald" id="mobDockAdd1">+1</button>
          <button type="button" class="btn btn-emerald" id="mobDockAdd5">+5</button>
          <button type="button" class="btn ${inCombo ? "btn-gold" : "btn-outline"}" id="mobDockCombo">${inCombo ? "★ Combo" : "☆ Combo"}</button>
          <button type="button" class="btn btn-gold" id="mobDockWatch">🎬 Arena</button>
        </div>
      `;
      const infoBtn = document.getElementById("mobDockToggleInfo");
      if (infoBtn) {
        infoBtn.addEventListener("click", () => {
          mobDockDetailsOpen = !mobDockDetailsOpen;
          renderMobileTreeActionDock();
        });
      }
      document.getElementById("mobDockSub1").addEventListener("click", () => adjustBuildSkillRank(sk.id, -1, def));
      document.getElementById("mobDockAdd1").addEventListener("click", () => adjustBuildSkillRank(sk.id, 1, def));
      document.getElementById("mobDockAdd5").addEventListener("click", () => adjustBuildSkillRank(sk.id, 5, def));
      document.getElementById("mobDockCombo").addEventListener("click", () => toggleSkillInActiveBuildRotation(sk.id));
      document.getElementById("mobDockWatch").addEventListener("click", () => {
        setMobileTab("arena");
        triggerSkillPreview(sk.id, true);
      });
      return;
    }

    dock.innerHTML = `
      <div class="mob-dock-top">
        <img src="${esc(sk.icon)}" alt="${esc(sk.name)}" />
        <div class="mob-dock-info">
          <div class="mob-dock-title">${esc(sk.name)}</div>
          <div class="mob-dock-sub">${esc(shortOriginTag(sk))} · ${esc(sk.castType || "Active")}</div>
        </div>
        <button type="button" class="btn btn-xs btn-outline mob-dock-info-toggle" id="mobDockToggleInfo">${mobDockDetailsOpen ? "Hide" : "📖 Info"}</button>
      </div>
      ${detailsDrawerHtml}
      <div class="mob-dock-btns">
        <button type="button" class="btn btn-gold" id="mobDockCast">🎬 Arena</button>
        ${
          hitInTree
            ? `<button type="button" class="btn btn-outline" id="mobDockSwap">🔄 Swap</button>`
            : `<button type="button" class="btn btn-outline" id="mobDockBrowse">📚 Skills</button>`
        }
        <button type="button" class="btn btn-outline" id="mobDockEdit">✏️ Edit</button>
        ${hitInTree ? `<button type="button" class="btn btn-danger-outline" id="mobDockRip">✕ Rip</button>` : ""}
      </div>
    `;

    const infoBtn2 = document.getElementById("mobDockToggleInfo");
    if (infoBtn2) {
      infoBtn2.addEventListener("click", () => {
        mobDockDetailsOpen = !mobDockDetailsOpen;
        renderMobileTreeActionDock();
      });
    }
    document.getElementById("mobDockCast").addEventListener("click", () => {
      setMobileTab("arena");
      triggerSkillPreview(sk.id, true);
    });
    const swapBtn = document.getElementById("mobDockSwap");
    if (swapBtn && hitInTree) {
      swapBtn.addEventListener("click", () => {
        const [tStr, cStr] = hitInTree.key.split("_");
        setTargetSlot({ treeIdx: hitInTree.treeIdx, tier: parseInt(tStr, 10), col: parseInt(cStr, 10) });
        setMobileTab("skills");
      });
    }
    const browseBtn = document.getElementById("mobDockBrowse");
    if (browseBtn) {
      browseBtn.addEventListener("click", () => setMobileTab("skills"));
    }
    document.getElementById("mobDockEdit").addEventListener("click", () => {
      if (hitInTree) openNodeEditorForCell(hitInTree.treeIdx, hitInTree.key);
      else openNodeEditorForSkill(sk.id);
    });
    const ripBtn = document.getElementById("mobDockRip");
    if (ripBtn && hitInTree) {
      ripBtn.addEventListener("click", () => ripSkillFromCell(hitInTree.treeIdx, hitInTree.key));
    }
  }

  function setMobileTab(tab) {
    const prevTab = normalizeMobileTab(state.mobileTab);
    const nextTab = normalizeMobileTab(tab);
    if (nextTab === "arena" && prevTab !== "arena") {
      arenaReturnOrigin.mobileTab = prevTab;
      arenaReturnOrigin.treeTab = currentHeroState().activeTab || "tree1";
      arenaReturnOrigin.skillId = currentHeroState().selectedSkillId || "";
    }
    state.mobileTab = nextTab;
    if (nextTab === "builds" && normalizeMode(state.activeMode) !== "builds") {
      state.activeMode = "builds";
      renderHeroSelect();
      renderBuildLoadoutDock();
      renderSkillTree();
      renderBuildComboStage();
    }
    if (nextTab === "matrix") {
      renderMatrixWorkspace();
    }
    renderArenaBreadcrumbBar();
    syncWorkspaceLayout();
    renderMobileTreeActionDock();
    if (nextTab === "tree") {
      requestAnimationFrame(() => {
        const hs = currentHeroState();
        drawTreePrereqArrows(getActiveTreeDefinition(currentHero(), hs), hs);
      });
    }
  }

  function syncWorkspaceLayout() {
    const mode = normalizeMode(state.activeMode);
    const isCodex = mode === "codex";
    const isBuilds = mode === "builds";
    const isMatrix = mode === "matrix";
    const isMobile = isMobileViewport();
    const mTab = normalizeMobileTab(state.mobileTab);
    const mStudio = document.getElementById("modeBtnStudio");
    const mBuilds = document.getElementById("modeBtnBuilds");
    const mCodex = document.getElementById("modeBtnCodex");
    const mMatrix = document.getElementById("modeBtnMatrix");
    const wStudio = document.getElementById("studioWorkspace");
    const wCodex = document.getElementById("codexWorkspace");
    const wMatrix = document.getElementById("matrixWorkspace");

    if (mStudio) mStudio.classList.toggle("active", mode === "trees");
    if (mBuilds) mBuilds.classList.toggle("active", isBuilds);
    if (mCodex) mCodex.classList.toggle("active", isCodex);
    if (mMatrix) mMatrix.classList.toggle("active", isMatrix);
    if (wStudio) wStudio.classList.toggle("hidden", !isMobile && (isCodex || isMatrix));
    if (wCodex) wCodex.classList.toggle("hidden", isMobile || !isCodex);
    if (wMatrix) wMatrix.classList.toggle("hidden", isMobile ? mTab !== "matrix" : !isMatrix);

    const guide = document.getElementById("quickGuideBanner");
    if (guide) guide.classList.toggle("hidden", Boolean(state.guideHidden));

    const studioGrid = document.getElementById("studioGrid");
    const paletteDock = document.getElementById("skillPaletteDock");
    const buildDock = document.getElementById("buildLoadoutDock");
    const btnExpand = document.getElementById("btnExpandPalette");
    const collapsed = Boolean(state.paletteCollapsed);
    if (studioGrid) studioGrid.classList.toggle("palette-collapsed", !isMobile && collapsed);
    if (paletteDock) {
      paletteDock.classList.toggle("hidden", isMobile ? mTab !== "skills" : collapsed || isBuilds);
    }
    if (buildDock) {
      buildDock.classList.toggle("hidden", isMobile ? mTab !== "builds" : collapsed || !isBuilds);
    }
    if (btnExpand) {
      btnExpand.classList.toggle("hidden", isMobile || !collapsed);
      btnExpand.textContent = isBuilds ? "⚔️ Hero Builds ▶" : "📚 Skill Palette ▶";
    }

    const btnAuto = document.getElementById("btnAutoLoop");
    if (btnAuto) {
      btnAuto.classList.toggle("active", Boolean(state.autoLoop));
      btnAuto.textContent = `⟳ Auto: ${state.autoLoop ? "ON" : "OFF"}`;
    }
    const btnSlow = document.getElementById("btnSlowMo");
    if (btnSlow) {
      btnSlow.classList.toggle("active", Boolean(state.slowMo));
    }
    const btnRunCombo = document.getElementById("btnRunCombo");
    if (btnRunCombo) {
      btnRunCombo.textContent = isBuilds ? "⚡ Play Build Combo" : "⚡ Chain Tree";
      btnRunCombo.title = isBuilds
        ? "Play your active Hero Build's rotation step-by-step in the arena"
        : "Chain skills from the active tree back-to-back";
    }

    renderMobileChrome();
    syncUndoButtons();
  }

  function setActiveMode(mode) {
    const nextMode = normalizeMode(mode);
    state.activeMode = nextMode;
    if (nextMode !== "builds") {
      state.comboLoop = false;
      arena.comboQueue = [];
      arena.activeComboIndex = -1;
      arena.activeComboSkillId = null;
    }
    syncWorkspaceLayout();
    saveState({ skipServer: true });
    renderAll();
  }

  function registerPwaServiceWorker() {
    if (!isHostedWebContext()) return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
    });
    window.addEventListener("appinstalled", () => {
      deferredInstallPrompt = null;
      showToast("📲 Installed Blood Crown Skill Forge App!");
    });
  }

  function bindEvents() {
    // Mode tabs (1. Skill Tree Architect / 2. Hero Builds & Playstyle / 3. Skill Codex / 4. Game Matrix & Pacing)
    document.getElementById("modeBtnStudio").addEventListener("click", () => setActiveMode("trees"));
    document.getElementById("modeBtnBuilds").addEventListener("click", () => {
      setActiveMode("builds");
      playActiveBuildCombo({ resetPack: true });
    });
    document.getElementById("modeBtnCodex").addEventListener("click", () => setActiveMode("codex"));
    const modeBtnMatrix = document.getElementById("modeBtnMatrix");
    if (modeBtnMatrix) {
      modeBtnMatrix.addEventListener("click", () => setActiveMode("matrix"));
    }
    document.getElementById("btnCodexBackToStudio").addEventListener("click", () => setActiveMode("trees"));

    // Quick guide toggle & 36s Companion Tutorial Video Modal
    const tutorialModalEl = document.getElementById("tutorialVideoModal");
    const tutorialVideoEl = document.getElementById("forgeTutorialVideoPlayer");
    if (tutorialVideoEl && window.BC_STANDALONE) {
      tutorialVideoEl.src = "https://unity7.github.io/blood-crown-forge/assets/video/blood_crown_forge_tutorial.mp4";
      tutorialVideoEl.poster = "https://unity7.github.io/blood-crown-forge/assets/video/tutorial_poster.jpg";
    }
    const syncTutorialChapterPills = (tSec) => {
      const bar = document.getElementById("tutorialChapterBar");
      if (!bar) return;
      const pills = Array.from(bar.querySelectorAll("[data-video-seek]"));
      let activeIdx = 0;
      pills.forEach((p, idx) => {
        const startSec = Number(p.dataset.videoSeek || 0);
        if (tSec >= startSec - 0.15) activeIdx = idx;
      });
      pills.forEach((p, idx) => p.classList.toggle("active", idx === activeIdx));
    };
    const openTutorialVideoModal = (seekSec = null) => {
      if (!tutorialModalEl) return;
      tutorialModalEl.classList.remove("hidden");
      if (tutorialVideoEl) {
        if (typeof seekSec === "number" && Number.isFinite(seekSec)) {
          try {
            tutorialVideoEl.currentTime = seekSec;
          } catch (_e) {}
          syncTutorialChapterPills(seekSec);
        }
        const playPromise = tutorialVideoEl.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      }
    };
    const pauseTutorialIfNeeded = () => {
      if (tutorialVideoEl && !tutorialVideoEl.paused) {
        tutorialVideoEl.pause();
      }
    };
    if (tutorialVideoEl) {
      tutorialVideoEl.addEventListener("timeupdate", () => {
        syncTutorialChapterPills(tutorialVideoEl.currentTime || 0);
      });
    }
    document.querySelectorAll("[data-video-seek]").forEach((pill) => {
      pill.addEventListener("click", () => {
        const sec = Number(pill.dataset.videoSeek || 0);
        openTutorialVideoModal(sec);
      });
    });
    const btnOpenTutorial = document.getElementById("btnOpenTutorialVideo");
    if (btnOpenTutorial) {
      btnOpenTutorial.addEventListener("click", () => openTutorialVideoModal());
    }
    const btnGuideWatch = document.getElementById("btnGuideWatchVideo");
    if (btnGuideWatch) {
      btnGuideWatch.addEventListener("click", () => openTutorialVideoModal(0));
    }
    const btnMobTutorial = document.getElementById("btnMobileTutorialVideo");
    if (btnMobTutorial) {
      btnMobTutorial.addEventListener("click", () => openTutorialVideoModal());
    }

    document.getElementById("btnToggleGuide").addEventListener("click", () => {
      state.guideHidden = !state.guideHidden;
      syncWorkspaceLayout();
      saveState({ skipServer: true });
    });
    document.getElementById("btnHideGuide").addEventListener("click", () => {
      state.guideHidden = true;
      syncWorkspaceLayout();
      saveState({ skipServer: true });
    });

    // Undo / Redo
    document.getElementById("btnUndo").addEventListener("click", performUndo);
    document.getElementById("btnRedo").addEventListener("click", performRedo);

    // PWA Install Button
    document.getElementById("btnInstallPwa").addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        try {
          await deferredInstallPrompt.userChoice;
        } catch (_e) {}
        deferredInstallPrompt = null;
      } else {
        document.getElementById("pwaHelpModal").classList.remove("hidden");
      }
    });

    // Global Search Bar -> syncs to Codex or Skill Palette
    document.getElementById("globalSearchInput").addEventListener("input", (e) => {
      const val = e.target.value;
      if (normalizeMode(state.activeMode) === "codex") {
        codexState.search = val;
        renderCodexWorkspace();
      } else {
        if (normalizeMode(state.activeMode) === "builds" && val.trim()) {
          state.activeMode = "trees";
        }
        if (state.paletteCollapsed) {
          state.paletteCollapsed = false;
        }
        syncWorkspaceLayout();
        paletteState.search = val;
        const pInput = document.getElementById("paletteSearchInput");
        if (pInput) pInput.value = val;
        renderSkillPalette();
      }
    });

    // Roster Hero Creation & 1-Click Clone
    document.getElementById("btnOpenNewHeroWizard").addEventListener("click", () => openHeroWizard("create"));
    document.getElementById("btnCloneCurrentHero").addEventListener("click", () => {
      cloneHeroById(currentHero().id);
    });
    document.getElementById("hwTemplateSelect").addEventListener("change", (e) => {
      if (wizardCtx.mode === "create") {
        applyWizardTemplateFields(e.target.value);
      }
    });
    document.getElementById("btnSaveHeroWizard").addEventListener("click", saveHeroWizardForm);

    // Docked Palette & Hero Builds Dock Collapse/Expand Controls
    const collapseLeftDock = () => {
      state.paletteCollapsed = true;
      syncWorkspaceLayout();
      saveState({ skipServer: true });
      requestAnimationFrame(() => {
        const hs = currentHeroState();
        drawTreePrereqArrows(getActiveTreeDefinition(currentHero(), hs), hs);
      });
    };
    document.getElementById("btnCollapsePalette").addEventListener("click", collapseLeftDock);
    document.getElementById("btnCollapseBuildsDock").addEventListener("click", collapseLeftDock);
    document.getElementById("btnExpandPalette").addEventListener("click", () => {
      state.paletteCollapsed = false;
      syncWorkspaceLayout();
      saveState({ skipServer: true });
      requestAnimationFrame(() => {
        const hs = currentHeroState();
        drawTreePrereqArrows(getActiveTreeDefinition(currentHero(), hs), hs);
      });
    });

    // Hero Builds Dock Quick Creation Buttons
    document.getElementById("btnNewBuildLoadout").addEventListener("click", () => createNewBuildForActiveHero("blank"));
    document.getElementById("btnCloneBuildLoadout").addEventListener("click", () => createNewBuildForActiveHero("duplicate"));
    document.getElementById("btnAutoFillBuild").addEventListener("click", () => createNewBuildForActiveHero("autofill"));

    document.getElementById("paletteSearchInput").addEventListener("input", (e) => {
      paletteState.search = e.target.value;
      document.getElementById("globalSearchInput").value = e.target.value;
      renderSkillPalette();
    });
    document.getElementById("paletteGameSelect").addEventListener("change", (e) => {
      paletteState.game = e.target.value;
      renderSkillPalette();
    });
    document.getElementById("paletteHeroSelect").addEventListener("change", (e) => {
      paletteState.hero = e.target.value;
      renderSkillPalette();
    });

    // Author New Skill buttons
    document.getElementById("btnCreateSkillFromPalette").addEventListener("click", openNodeEditorForCreate);
    document.getElementById("btnCodexCreateSkill").addEventListener("click", openNodeEditorForCreate);

    // Codex Search
    document.getElementById("codexSearchInput").addEventListener("input", (e) => {
      codexState.search = e.target.value;
      document.getElementById("globalSearchInput").value = e.target.value;
      renderCodexWorkspace();
    });

    // Tree Board Header Actions
    document.getElementById("btnEditTreeMeta").addEventListener("click", () => {
      const hs = currentHeroState();
      if (hs.activeTab === "tree4" || hs.activeTab === "tree5") return;
      const tIdx = getActiveClassTreeIndex(hs);
      openHeroWizard("edit", currentHero().id, `hwTree${tIdx + 1}Name`);
    });
    document.getElementById("btnAutoWireTree").addEventListener("click", autoWireActiveTree);
    document.getElementById("btnClearTreePoints").addEventListener("click", () => {
      const hs = currentHeroState();
      const activeBuild = currentActiveBuild();
      pushUndoSnapshot();
      activeBuild.ranks = {};
      hs.ranks = activeBuild.ranks;
      saveState();
      renderAll();
      showToast(`↺ Reset all points in "${activeBuild.name}" to 0/${MAX_SKILL_POINTS} (Ctrl+Z to undo)`);
    });
    document.getElementById("btnEmptyTreeSlots").addEventListener("click", () => {
      const hs = currentHeroState();
      if (hs.activeTab === "tree4" || hs.activeTab === "tree5") return;
      const idx = getActiveClassTreeIndex(hs);
      pushUndoSnapshot();
      hs.treeGrid[idx] = {};
      if (hs.prereqByTree) hs.prereqByTree[idx] = {};
      reconcileHeroBuilds(currentHero(), hs);
      targetSlot = { treeIdx: idx, tier: 1, col: 0 };
      saveState();
      renderAll();
      showToast(`🧹 Ripped all nodes from Tree ${idx + 1} (Ctrl+Z to undo)`);
    });

    // Node Editor Modal Controls
    document.getElementById("neIconSearch").addEventListener("input", renderNodeEditorIconGrid);
    document.getElementById("neIconGroup").addEventListener("change", renderNodeEditorIconGrid);
    document.getElementById("btnSaveNodeSkill").addEventListener("click", () => saveNodeEditor(false));
    document.getElementById("btnForkNodeSkill").addEventListener("click", () => saveNodeEditor(true));
    document.getElementById("btnDeleteNodeInModal").addEventListener("click", () => {
      if (nodeEditorCtx.mode === "slot") {
        const key = `${nodeEditorCtx.tier}_${nodeEditorCtx.col}`;
        document.getElementById("nodeEditorModal").classList.add("hidden");
        ripSkillFromCell(nodeEditorCtx.treeIdx, key);
      }
    });

    // Data Backup / Share Modal
    document.getElementById("btnDataModal").addEventListener("click", openDataModal);
    document.getElementById("btnDownloadJson").addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(buildPortableExportPayload(), null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `blood-crown-builds-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast("⬇️ Downloaded JSON build backup");
    });

    document.getElementById("inputImportJsonFile").addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result || ""));
          importPortablePayload(parsed);
          document.getElementById("dataModal").classList.add("hidden");
          showToast(`📂 Imported workspace backup from "${file.name}"`);
        } catch (_err) {
          showToast("⚠️ Could not parse JSON file");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });

    document.getElementById("btnApplyPastedJson").addEventListener("click", () => {
      try {
        const raw = document.getElementById("jsonExportArea").value;
        importPortablePayload(JSON.parse(raw));
        document.getElementById("dataModal").classList.add("hidden");
        showToast("✅ Applied pasted JSON workspace");
      } catch (_err) {
        showToast("⚠️ Invalid JSON — check syntax and try again");
      }
    });

    document.getElementById("btnCopyShareUrl").addEventListener("click", async () => {
      const url = buildActiveHeroShareUrl();
      const area = document.getElementById("jsonExportArea");
      if (area) area.value = url;
      try {
        await navigator.clipboard.writeText(url);
        showToast("🔗 Copied shareable build link to clipboard!");
      } catch (_e) {
        if (area) {
          area.focus();
          area.select();
        }
        showToast("🔗 Share link generated in box below — press Ctrl+C to copy!");
      }
    });

    document.getElementById("btnFactoryResetAll").addEventListener("click", () => {
      pushUndoSnapshot();
      state = makeFreshDefaultState();
      rebuildSkillMap();
      targetSlot = null;
      document.getElementById("dataModal").classList.add("hidden");
      saveState();
      syncWorkspaceLayout();
      renderAll();
      triggerSkillPreview(currentHeroState().selectedSkillId, true);
      showToast("🧨 Factory reset complete (press Ctrl+Z to undo)");
    });

    // Modal Backdrop & Close Buttons
    document.querySelectorAll("[data-close]").forEach((b) => {
      b.addEventListener("click", () => {
        const m = document.getElementById(b.dataset.close);
        if (m) m.classList.add("hidden");
        if (b.dataset.close === "tutorialVideoModal") pauseTutorialIfNeeded();
      });
    });
    document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          backdrop.classList.add("hidden");
          if (backdrop.id === "tutorialVideoModal") pauseTutorialIfNeeded();
        }
      });
    });

    // Visualizer Controls
    document.getElementById("btnCastSelected").addEventListener("click", () => {
      state.comboLoop = false;
      arena.comboQueue = [];
      arena.activeComboIndex = -1;
      arena.activeComboSkillId = null;
      if (normalizeMode(state.activeMode) === "builds") renderBuildComboStage();
      triggerSkillPreview(currentHeroState().selectedSkillId, false);
    });

    const btnWeaponSwing = document.getElementById("btnCastWeaponSwing");
    if (btnWeaponSwing) {
      btnWeaponSwing.addEventListener("click", () => {
        state.comboLoop = false;
        arena.comboQueue = [];
        arena.activeComboIndex = -1;
        arena.activeComboSkillId = null;
        castWeaponAutoSwing();
      });
    }

    document.getElementById("btnAutoLoop").addEventListener("click", () => {
      state.autoLoop = !state.autoLoop;
      if (state.autoLoop) state.comboLoop = false;
      syncWorkspaceLayout();
      if (normalizeMode(state.activeMode) === "builds") renderBuildComboStage();
      saveState({ skipServer: true });
    });

    document.getElementById("btnSlowMo").addEventListener("click", () => {
      state.slowMo = !state.slowMo;
      syncWorkspaceLayout();
      saveState({ skipServer: true });
    });

    document.getElementById("btnRunCombo").addEventListener("click", () => {
      if (normalizeMode(state.activeMode) === "builds") {
        playActiveBuildCombo({ resetPack: true });
        return;
      }
      const hs = currentHeroState();
      const def = getActiveTreeDefinition(currentHero(), hs);
      const ids = Object.values(def.cells)
        .filter((id) => ALL_SKILLS.has(id))
        .slice(0, 4);
      if (ids.length) {
        resetArenaDummies();
        arena.comboSequenceIds = [...ids];
        arena.comboQueue = [...ids];
        arena.comboTimer = 0.05;
      }
    });

    document.getElementById("btnResetArena").addEventListener("click", () => {
      resetArenaDummies();
    });

    const vizQuickBack = document.getElementById("btnVizQuickBack");
    if (vizQuickBack) {
      vizQuickBack.addEventListener("click", executeFastReturnFromArena);
    }

    // Native Mobile SPA Top Header & 5-Tab Bottom Bar
    const mobHeroPicker = document.getElementById("btnMobileHeroPicker");
    if (mobHeroPicker) {
      mobHeroPicker.addEventListener("click", () => {
        setMobileTab(normalizeMobileTab(state.mobileTab) === "heroes" ? "tree" : "heroes");
      });
    }
    const mobModeTrees = document.getElementById("btnMobileModeTrees");
    if (mobModeTrees) {
      mobModeTrees.addEventListener("click", () => {
        if (normalizeMobileTab(state.mobileTab) === "builds") {
          state.mobileTab = "tree";
        }
        setActiveMode("trees");
      });
    }
    const mobModeBuilds = document.getElementById("btnMobileModeBuilds");
    if (mobModeBuilds) {
      mobModeBuilds.addEventListener("click", () => {
        if (normalizeMobileTab(state.mobileTab) === "skills") {
          state.mobileTab = "builds";
        }
        setActiveMode("builds");
        playActiveBuildCombo({ resetPack: true });
      });
    }
    const mobUndo = document.getElementById("btnMobileUndo");
    if (mobUndo) {
      mobUndo.addEventListener("click", performUndo);
    }
    const mobMenu = document.getElementById("btnMobileMenu");
    if (mobMenu) {
      mobMenu.addEventListener("click", openDataModal);
    }
    document.querySelectorAll("[data-mob-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const nextTab = btn.dataset.mobTab;
        setMobileTab(nextTab);
        if (nextTab === "arena" && normalizeMode(state.activeMode) === "builds" && !arena.comboQueue.length) {
          playActiveBuildCombo({ resetPack: false });
        }
      });
    });

    canvas.addEventListener("pointerdown", (e) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const sx = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const sy = ((e.clientY - rect.top) / rect.height) * canvas.height;
      arena.aim = screenToIso(sx, sy);
      triggerSkillPreview(currentHeroState().selectedSkillId, false);
    });

    window.addEventListener("resize", () => {
      syncWorkspaceLayout();
      renderArenaBreadcrumbBar();
      const hs = currentHeroState();
      drawTreePrereqArrows(getActiveTreeDefinition(currentHero(), hs), hs);
    });

    // Global Keyboard Shortcuts (/, Ctrl+K, Ctrl+Z, Ctrl+Y, Delete, Escape)
    window.addEventListener("keydown", (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const inEditable = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target && e.target.isContentEditable);
      const anyModalOpen = Boolean(document.querySelector(".modal-backdrop:not(.hidden)"));

      if (e.key === "Escape") {
        const openModal = document.querySelector(".modal-backdrop:not(.hidden)");
        if (openModal) {
          openModal.classList.add("hidden");
          if (openModal.id === "tutorialVideoModal") pauseTutorialIfNeeded();
          return;
        }
        if (targetSlot) {
          setTargetSlot(null);
          return;
        }
        if ((isMobileViewport() && normalizeMobileTab(state.mobileTab) === "arena") || (!isMobileViewport() && arenaReturnOrigin.desktopFromCodex)) {
          executeFastReturnFromArena();
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const gs = document.getElementById("globalSearchInput");
        if (gs) {
          gs.focus();
          gs.select();
        }
        return;
      }

      if (!inEditable && !anyModalOpen && e.key === "/") {
        e.preventDefault();
        const gs = document.getElementById("globalSearchInput");
        if (gs) {
          gs.focus();
          gs.select();
        }
        return;
      }

      if (!inEditable && !anyModalOpen && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) performRedo();
        else performUndo();
        return;
      }

      if (!inEditable && !anyModalOpen && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        performRedo();
        return;
      }

      if (!inEditable && !anyModalOpen && e.key === "Delete" && normalizeMode(state.activeMode) === "trees") {
        const hs = currentHeroState();
        const hit = findCellOfSkillInActiveTree(currentHero(), hs, hs.selectedSkillId);
        if (hit) {
          e.preventDefault();
          ripSkillFromCell(hit.treeIdx, hit.key);
        }
      }
    });
  }

  // ==========================================================================
  // 12. MASTER GAME MATRIX, TWO-BOX PACING METER & D2R ORACLE WORKSPACE (MODE 4)
  // ==========================================================================
  function buildMatrixMonsterSvg(lifeRows) {
    const rows = Array.isArray(lifeRows) && lifeRows.length ? lifeRows : [];
    if (!rows.length) return "";
    const w = 560;
    const h = 215;
    const padL = 48;
    const padR = 18;
    const padT = 22;
    const padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const maxLog = Math.log10(100000);
    const minLog = 0;

    const xOf = (lvl) => padL + ((lvl - 1) / 98) * plotW;
    const yOf = (hp) => {
      const lg = Math.log10(Math.max(1, hp));
      return padT + plotH - ((lg - minLog) / (maxLog - minLog)) * plotH;
    };

    const d2Pts = rows.map((r) => `${xOf(r.level).toFixed(1)},${yOf(r.d2Monster1pHp).toFixed(1)}`).join(" ");
    const d28Pts = rows.map((r) => `${xOf(r.level).toFixed(1)},${yOf(r.d2Monster8pHp).toFixed(1)}`).join(" ");
    const bcPts = rows.map((r) => `${xOf(r.level).toFixed(1)},${yOf(r.bcStandardMobHp).toFixed(1)}`).join(" ");
    const curX = xOf(matrixState.level || 30).toFixed(1);

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;" role="img" aria-label="D2R vs Blood Crown Monster HP Curve (Log10)">
        <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#0d0a12" />
        ${[1, 10, 100, 1000, 10000, 100000]
          .map((val) => {
            const yy = yOf(val).toFixed(1);
            const lbl = val >= 1000 ? `${val / 1000}k` : `${val}`;
            return `<line x1="${padL}" y1="${yy}" x2="${w - padR}" y2="${yy}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="3,3" />
                    <text x="${padL - 6}" y="${Number(yy) + 3}" fill="#9c8f7a" font-size="9.5" text-anchor="end">${lbl}</text>`;
          })
          .join("")}
        <line x1="${curX}" y1="${padT}" x2="${curX}" y2="${h - padB}" stroke="rgba(240,198,116,0.45)" stroke-width="1.5" stroke-dasharray="4,3" />
        <polyline fill="none" stroke="#ff6b6b" stroke-width="2.2" stroke-dasharray="5,3" points="${d28Pts}" />
        <polyline fill="none" stroke="#ff9f43" stroke-width="2.4" points="${d2Pts}" />
        <polyline fill="none" stroke="#4ade80" stroke-width="3" points="${bcPts}" />
        ${rows
          .map(
            (r) => `
          <circle cx="${xOf(r.level).toFixed(1)}" cy="${yOf(r.d2Monster1pHp).toFixed(1)}" r="3" fill="#ff9f43" />
          <circle cx="${xOf(r.level).toFixed(1)}" cy="${yOf(r.bcStandardMobHp).toFixed(1)}" r="3.5" fill="#4ade80" />
          <text x="${xOf(r.level).toFixed(1)}" y="${h - 10}" fill="#b7aa95" font-size="9.5" text-anchor="middle">L${r.level}</text>
        `
          )
          .join("")}
        <text x="${padL + 6}" y="15" fill="#4ade80" font-size="10" font-weight="bold">━ Blood Crown Standard Mob (+4.5%/lvl = Locked 5-Hit Box)</text>
        <text x="${w - padR}" y="15" fill="#ff9f43" font-size="10" font-weight="bold" text-anchor="end">━ D2R 1p  ┄ D2R 8p (+38,000% Wall)</text>
      </svg>
    `;
  }

  function buildMatrixSpeedSvg(speedSheet) {
    const ama = (speedSheet && speedSheet.d2AmaApsByIas) || [];
    const bc = (speedSheet && speedSheet.bcSmoothApsBySpeed) || [];
    if (!ama.length || !bc.length) return "";
    const w = 560;
    const h = 215;
    const padL = 44;
    const padR = 18;
    const padT = 22;
    const padB = 30;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const minY = 1.4;
    const maxY = 3.4;

    const xOf = (pct) => padL + (pct / 120) * plotW;
    const yOf = (aps) => padT + plotH - ((aps - minY) / (maxY - minY)) * plotH;

    const d2Pts = ama.map((p) => `${xOf(p.statPct).toFixed(1)},${yOf(p.aps).toFixed(1)}`).join(" ");
    const bcPts = bc.map((p) => `${xOf(p.statPct).toFixed(1)},${yOf(p.aps).toFixed(1)}`).join(" ");
    const capX = xOf(40).toFixed(1);

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;display:block;" role="img" aria-label="D2R 25fps IAS Stair-Step Breakpoints vs Blood Crown Smooth Action Speed">
        <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#0d0a12" />
        ${[1.5, 2.0, 2.5, 3.0]
          .map((val) => {
            const yy = yOf(val).toFixed(1);
            return `<line x1="${padL}" y1="${yy}" x2="${w - padR}" y2="${yy}" stroke="rgba(255,255,255,0.07)" stroke-dasharray="3,3" />
                    <text x="${padL - 6}" y="${Number(yy) + 3}" fill="#9c8f7a" font-size="9.5" text-anchor="end">${val.toFixed(1)}/s</text>`;
          })
          .join("")}
        <line x1="${capX}" y1="${padT}" x2="${capX}" y2="${h - padB}" stroke="rgba(103,196,255,0.45)" stroke-width="1.5" stroke-dasharray="4,3" />
        <text x="${Number(capX) + 4}" y="${padT + 12}" fill="#67c4ff" font-size="9">+40% Gear Cap (Readable Animations)</text>
        <polyline fill="none" stroke="#ff9f43" stroke-width="2.3" points="${d2Pts}" />
        <polyline fill="none" stroke="#4ade80" stroke-width="3" points="${bcPts}" />
        ${[0, 20, 40, 60, 80, 100, 120]
          .map(
            (pct) =>
              `<text x="${xOf(pct).toFixed(1)}" y="${h - 10}" fill="#b7aa95" font-size="9.5" text-anchor="middle">+${pct}%</text>`
          )
          .join("")}
        <text x="${padL + 6}" y="15" fill="#4ade80" font-size="10" font-weight="bold">━ Blood Crown Smooth Action Speed (0 Dead %)</text>
        <text x="${w - padR}" y="15" fill="#ff9f43" font-size="10" font-weight="bold" text-anchor="end">━ D2R 25fps Breakpoint Steps</text>
      </svg>
    `;
  }

  function downloadMonsterCurveTsv() {
    const header = [
      "Level",
      "BC_WeaponPower",
      "BC_HeroHP_Mid",
      "BC_SwarmHP_3Hit",
      "BC_StandardHP_5Hit",
      "BC_BruteHP_8Hit",
      "BC_EliteHP_12Hit",
      "BC_BossHP_45s",
      "BC_PvPRivalHP_8Hit",
    ].join("\t");
    const lines = [header];
    for (let lv = 1; lv <= 99; lv++) {
      lines.push(
        [
          lv,
          bcBaseWeaponPower(lv).toFixed(1),
          bcHeroMaxHp(lv, "mid"),
          bcMonsterStats(lv, "trash").hp,
          bcMonsterStats(lv, "standard").hp,
          bcMonsterStats(lv, "brute").hp,
          bcMonsterStats(lv, "elite").hp,
          bcMonsterStats(lv, "boss").hp,
          bcMonsterStats(lv, "pvp_duel").hp,
        ].join("\t")
      );
    }
    const blob = new Blob([lines.join("\n")], { type: "text/tab-separated-values" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bc_monlvl_preview.tsv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("⬇️ Exported 99-Level Blood Crown Monster & Power Curve TSV!");
  }

  function renderMatrixWorkspace() {
    const pacing = evaluateLivePacingMatrix();
    const badge = document.getElementById("matrixStatusBadge");
    if (badge) {
      badge.textContent = `${pacing.inBoxCount}/15`;
    }

    const wrap = document.getElementById("matrixWorkspace");
    if (!wrap) return;
    const isVisible =
      normalizeMode(state.activeMode) === "matrix" ||
      (isMobileViewport() && normalizeMobileTab(state.mobileTab) === "matrix");
    if (!isVisible) return;

    const hero = currentHero();
    const heroMeta = getHeroDisplayMeta(hero);
    const hs = currentHeroState();
    const build = currentActiveBuild();
    const sk = getSkill(hs.selectedSkillId);
    const activeMod = getActiveSkillModifierForBuild(sk.id, build);
    const compatMods = (getCompatibleModifiersForSkill(sk).curated || []).slice(0, 3);
    const curWmb = build.weaponMiniBuildId ? getWeaponMiniBuild(build.weaponMiniBuildId) : null;
    const sim = evalActiveHeroCombat();
    const sheets = GAME_MATRIX.d2ComparisonSheets || {};
    const decisions = GAME_MATRIX.plainEnglishDecisions || [];
    const hooks = GAME_MATRIX.engineHooks || [];
    const subTab = matrixState.subTab || "combat";

    const allTierIds = ["trash", "standard", "brute", "elite", "boss", "pvp_duel"];
    const allTierSims = allTierIds.map((tid) => evalActiveHeroCombat({ targetTier: tid }));

    let bodyHtml = "";

    if (subTab === "combat") {
      bodyHtml = `
        <div class="matrix-controls-card">
          <div class="matrix-ctrl-group">
            <label>Character / Zone Level: <strong style="color:var(--gold-bright);">Lvl ${sim.level}</strong> (Weapon Power: ${sim.weaponPower})</label>
            <input type="range" min="1" max="99" value="${sim.level}" id="matLevelSlider" class="pacing-slider" />
            <div class="matrix-pill-strip">
              ${[1, 12, 24, 30, 45, 60, 75, 90, 99]
                .map(
                  (lv) =>
                    `<button type="button" class="act-mini-btn ${sim.level === lv ? "active" : ""}" data-mat-lvl="${lv}">L${lv}</button>`
                )
                .join("")}
            </div>
          </div>

          <div class="matrix-ctrl-group">
            <label>Gear Progression Tier (Bounded 2.08× Ceiling)</label>
            <div class="matrix-pill-strip">
              ${[
                { id: "starter", lbl: "Starter (+15% Dmg)" },
                { id: "mid", lbl: "Mid-Campaign (+65% Dmg)" },
                { id: "endgame", lbl: "Endgame BiS (+140% Dmg)" },
              ]
                .map(
                  (g) =>
                    `<button type="button" class="act-mini-btn ${sim.gearTier === g.id ? "active" : ""}" data-mat-gear="${g.id}">${g.lbl}</button>`
                )
                .join("")}
            </div>
            <label style="margin-top:6px;">Equipped Weapon Archetype (10 Families — Auto Geometry)</label>
            <select id="matWeaponSelect" class="matrix-select">
              ${WEAPON_ARCHETYPES.map(
                (w) =>
                  `<option value="${esc(w.id)}" ${sim.weaponId === w.id ? "selected" : ""}>${esc(w.name)} — ${w.attacksPerSec}/s · ${w.reachMeters}m</option>`
              ).join("")}
            </select>
          </div>

          <div class="matrix-ctrl-group">
            <label>Target Encounter Tier (Master HTK Curve)</label>
            <div class="matrix-pill-strip">
              ${[
                { id: "trash", lbl: "Swarm (3h)" },
                { id: "standard", lbl: "Standard (5h)" },
                { id: "brute", lbl: "Brute (8h)" },
                { id: "elite", lbl: "Elite (12h)" },
                { id: "boss", lbl: "Boss (45s)" },
                { id: "pvp_duel", lbl: "PvP Duel (8h)" },
              ]
                .map(
                  (t) =>
                    `<button type="button" class="act-mini-btn ${sim.targetTier === t.id ? "active" : ""}" data-mat-tier="${t.id}">${t.lbl}</button>`
                )
                .join("")}
            </div>
            <label style="margin-top:6px;">Rank-4 Behavior Mutator on <strong>${esc(sk.name.split("(")[0].trim())}</strong> (Zero-DPS-Sum)</label>
            <div class="matrix-pill-strip">
              <button type="button" class="act-mini-btn ${!activeMod ? "active" : ""}" data-mat-mod="">Base (Unmodified)</button>
              ${compatMods
                .map(
                  (m, idx) =>
                    `<button type="button" class="act-mini-btn ${activeMod && activeMod.id === m.id ? "active" : ""}" data-mat-mod="${esc(m.id)}">[${String.fromCharCode(65 + idx)}] ${esc(m.name.split("(")[0].trim())}</button>`
                )
                .join("")}
            </div>
          </div>
        </div>

        <div class="matrix-kpi-grid">
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">Hit Damage (Zero AR)</span>
            <span class="matrix-kpi-v gold">${Math.round(sim.finalHitDamage)}</span>
            <span class="matrix-kpi-sub">100% Contact Hit · ${sim.effectiveAps} swings/s</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">${esc(sim.targetLabel)}</span>
            <span class="matrix-kpi-v ${sim.inTargetBox ? "emerald" : "crimson"}">${sim.hitsToKill} hits (${sim.secondsToKill}s)</span>
            <span class="matrix-kpi-sub">Target Box: ${sim.targetBox[0]}–${sim.targetBox[1]} ${sim.targetTier === "boss" ? "sec" : "hits"} (${sim.inTargetBox ? "IN BOX" : "SHIFTED"})</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">5-Mob Pack Clear</span>
            <span class="matrix-kpi-v cyan">${sim.packSwingsToClear5} swings (${sim.packSecondsToClear5}s)</span>
            <span class="matrix-kpi-sub">Hits up to ${sim.packTargetsPerSwing} foes/cast via geometry</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">Poise Flinch (≥12% HP)</span>
            <span class="matrix-kpi-v ${sim.triggersPoiseFlinch ? "gold" : ""}">${sim.poiseHitPctMaxHp}% Max HP</span>
            <span class="matrix-kpi-sub">${sim.triggersPoiseFlinch ? "⚡ Triggers 280ms Stagger (1.2s ICD)" : "Fast chip hit (below 12% stagger)"}</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">Hero Survivability</span>
            <span class="matrix-kpi-v emerald">${sim.heroMaxHp} HP · ${sim.heroArmorDrPct}% DR</span>
            <span class="matrix-kpi-sub">Survives ${sim.heroHitsToDie} standard hits (Full Armor while Sprinting)</span>
          </div>
        </div>

        <div class="matrix-two-col">
          <div>
            <div class="bc-sixline-tooltip">
              <div class="bctt-header">
                <div>
                  <div class="bctt-title">${esc(curWmb ? curWmb.name : sim.weaponName)}</div>
                  <div class="bctt-sub">2-Second Read · Strict ≤6-Line Blood Crown Tooltip Cap</div>
                </div>
                <span class="grade-pill ok">${sim.tooltip6Lines.length}/6 Lines</span>
              </div>
              <ol class="bctt-lines">
                ${sim.tooltip6Lines.map((ln) => `<li>${esc(ln)}</li>`).join("")}
              </ol>
            </div>
            <div style="margin-top:10px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.025);border:1px solid rgba(226,184,96,0.18);font-size:0.77rem;color:var(--text-muted);">
              <strong style="color:var(--gold-bright);">Tactical Sweetspot:</strong> ${esc(sim.sweetspotNote)}
            </div>
          </div>

          <div class="matrix-table-wrap">
            <table class="matrix-table">
              <thead>
                <tr>
                  <th>Encounter Tier</th>
                  <th>Defender HP / DR</th>
                  <th>Your Hit</th>
                  <th>Hits to Kill</th>
                  <th>Time to Kill</th>
                  <th>Poise %</th>
                  <th>Box Status</th>
                </tr>
              </thead>
              <tbody>
                ${allTierSims
                  .map(
                    (ts) => `
                  <tr style="${ts.targetTier === sim.targetTier ? "background:rgba(232,190,104,0.09);" : ""}">
                    <td><strong>${esc(ts.targetLabel)}</strong></td>
                    <td>${ts.targetMaxHp} HP · ${ts.effectiveTargetDrPct}% DR</td>
                    <td style="color:var(--gold-bright);font-weight:700;">${Math.round(ts.finalHitDamage)}</td>
                    <td><strong>${ts.hitsToKill}</strong> hits</td>
                    <td>${ts.secondsToKill}s</td>
                    <td>${ts.poiseHitPctMaxHp}% ${ts.triggersPoiseFlinch ? "⚡" : ""}</td>
                    <td><span class="grade-pill ${ts.inTargetBox ? "ok" : "edge"}">${ts.inTargetBox ? "IN BOX" : `Target ${ts.targetBox[0]}–${ts.targetBox[1]}`}</span></td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (subTab === "pacing") {
      bodyHtml = `
        <div class="matrix-controls-card" style="grid-template-columns: 1fr auto; align-items:center;">
          <div>
            <div style="font-family:var(--font-display);font-size:0.95rem;font-weight:700;color:var(--gold-bright);">
              📏 Two-Box Pacing Meter (Live Weighted RMS Distance = <span style="color:${pacing.overallGrade === "in box" ? "#6cf0a6" : "#ffd678"};">${pacing.paceDistance.toFixed(3)}</span> · ${pacing.inBoxCount}/15 IN BOX)
            </div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px;">
              <strong>Box 1 (D2R Feel Anchor):</strong> Walk 6.4 yd/s, Run 9.6 yd/s, Camera 26.5 tiles, Base Swing Wind-Up. &nbsp;|&nbsp;
              <strong>Box 2 (Blood Crown Target):</strong> 5-Hit Standard Mob, 12% Poise Flinch, ≤2.5× Dash Cap, ~8.2s Equal-Gear PvP Duel. Drag any slider below to test feel drift!
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-outline" id="btnResetPacingSliders">↺ Reset to BC Baseline (0.228)</button>
        </div>

        <div class="pacing-rows-grid">
          ${pacing.rows
            .map((r) => {
              const gCls = r.grade === "in box" ? "ok" : r.grade === "near edge" ? "edge" : "out";
              const minV = r.ruleKind === "band" ? Number((r.bandMin * 0.65).toFixed(2)) : 0;
              const maxV = r.ruleKind === "band" ? Number((r.bandMax * 1.35).toFixed(2)) : Number((r.capMax * 1.5).toFixed(2));
              const stepV = maxV <= 5 ? 0.05 : maxV <= 35 ? 0.2 : 1;
              return `
                <div class="pacing-row-card">
                  <div class="prc-top">
                    <div>
                      <div class="prc-title">#${r.row} · ${esc(r.name)}</div>
                      <div style="font-size:0.7rem;color:var(--cyan);font-weight:700;">${esc(r.box)}</div>
                    </div>
                    <span class="grade-pill ${gCls}">${r.grade.toUpperCase()} (d=${r.dev})</span>
                  </div>
                  <div class="prc-meta">
                    <span><strong>D2R Ref:</strong> ${esc(r.d2Ref)}</span>
                    <span><strong>Target:</strong> ${esc(r.targetText)}</span>
                    <span><strong>Live:</strong> <strong style="color:var(--gold-bright);">${r.measuredValue} ${esc(r.unit)}</strong></span>
                  </div>
                  <div class="prc-slider-row">
                    <input type="range" class="pacing-slider" min="${minV}" max="${maxV}" step="${stepV}" value="${r.measuredValue}" data-pacing-slider="${esc(r.id)}" />
                    <span style="font-size:0.74rem;font-weight:700;min-width:58px;text-align:right;color:var(--gold-bright);">${r.measuredValue}</span>
                  </div>
                  <div style="font-size:0.73rem;color:var(--text-dim);">${esc(r.why)}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    } else if (subTab === "oracle") {
      const s1 = sheets.sheet1Life || [];
      const s2 = sheets.sheet2Damage || {};
      const s3 = sheets.sheet3Defence || {};
      const s4 = sheets.sheet4Speed || {};
      const s5 = sheets.sheet5Fights || [];
      bodyHtml = `
        <div class="matrix-two-col">
          <div class="matrix-svg-box">
            <div style="font-family:var(--font-display);font-size:0.84rem;font-weight:700;color:var(--gold-bright);margin-bottom:6px;">
              📈 Monster HP Inflation (L1 → L99 Log10): D2R +38,000% Wall vs Blood Crown +4.5%/lvl
            </div>
            ${buildMatrixMonsterSvg(s1)}
          </div>
          <div class="matrix-svg-box">
            <div style="font-family:var(--font-display);font-size:0.84rem;font-weight:700;color:var(--gold-bright);margin-bottom:6px;">
              ⚡ Animation Speed: D2R 25fps Stair-Steps vs Blood Crown Smooth Action Speed
            </div>
            ${buildMatrixSpeedSvg(s4)}
          </div>
        </div>

        <div class="matrix-kpi-grid">
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">D2R Synergy Bloat vs BC</span>
            <span class="matrix-kpi-v crimson">LF: ${s2.d2LightningFuryL20UnsynergizedMax || 590} → ${s2.d2LightningFuryL30SynergizedMax || 2278}</span>
            <span class="matrix-kpi-sub">BC replaces 80-pt synergy tax with 2.08× gear band + [A/B/C] Mutators</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">Hit Chance &amp; Running Armor</span>
            <span class="matrix-kpi-v emerald">${s3.bcHitChanceContactPct || 100}% vs D2R ${s3.d2HitChanceL60ExamplePct || 56}%</span>
            <span class="matrix-kpi-sub">D2R Running Defense = 0 · BC keeps full Armor DR while sprinting</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">Hell Immunities</span>
            <span class="matrix-kpi-v gold">0 Immunities (50% Cap)</span>
            <span class="matrix-kpi-sub">D2R: 100%+ bricked elements · BC: Monsters cap at 50% resist</span>
          </div>
          <div class="matrix-kpi-card">
            <span class="matrix-kpi-k">PvP 1,000 Raw Hit</span>
            <span class="matrix-kpi-v cyan">${s3.bcPvp1000With30Dr || 245} Dmg (BC)</span>
            <span class="matrix-kpi-sub">D2R 0.17× cut = ${s3.d2Pvp1000CutTo || 170} + 75% passive RNG shield block</span>
          </div>
        </div>

        <div class="matrix-table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Canonical Benchmark (2,000 Seeded D2MOO Runs vs Blood Crown)</th>
                <th>D2R Hit %</th>
                <th>D2R Median Casts / TTK</th>
                <th>D2R FHR %</th>
                <th>BC Hit %</th>
                <th>BC Hits / TTK</th>
                <th>BC 5-Pack Clear</th>
                <th>BC Box</th>
              </tr>
            </thead>
            <tbody>
              ${s5
                .map(
                  (f) => `
                <tr>
                  <td><strong>${esc(f.label)}</strong></td>
                  <td style="color:${f.d2.toHitPct < 75 ? "#ff9898" : "var(--text-main)"};">${f.d2.toHitPct}%${f.d2.blockPct ? ` (${f.d2.blockPct}% blk)` : ""}</td>
                  <td>${f.d2.attacksMedian} casts · ${f.d2.secondsMedian !== null ? `${f.d2.secondsMedian}s` : "—"}</td>
                  <td>${f.d2.hitRecoveryPct}% RNG</td>
                  <td style="color:#6cf0a6;font-weight:700;">${f.bc.toHitPct}%</td>
                  <td><strong>${f.bc.hitsToKill} hits · ${f.bc.secondsToKill}s</strong></td>
                  <td>${f.bc.packSecondsToClear5}s</td>
                  <td><span class="grade-pill ${f.bc.inTargetBox ? "ok" : "edge"}">${f.bc.inTargetBox ? "IN BOX" : "EDGE"}</span></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="verdict-grid">
          ${decisions
            .map((d) => {
              const vUp = String(d.verdict || "").toUpperCase();
              const cls = vUp.includes("DELETE")
                ? "delete"
                : vUp.includes("SIMPLIFY") || vUp.includes("REPLACE") || vUp.includes("CAP")
                ? "simplify"
                : "keep";
              return `
                <article class="verdict-card">
                  <div class="vc-top">
                    <div class="vc-topic">${esc(d.topic)}</div>
                    <span class="verdict-badge ${cls}">${esc(d.verdict)}</span>
                  </div>
                  <div class="vc-rule">${esc(d.plainRule)}</div>
                  <div class="vc-modern"><strong>Modern ARPG Standard:</strong> ${esc(d.modernComparison)}</div>
                </article>
              `;
            })
            .join("")}
        </div>

        <div class="matrix-table-wrap">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Engine Layer (6 Surgical Hooks — ~55 Lines Total)</th>
                <th>D2R / D2MOO Decompiled Source</th>
                <th>Blood Crown Native / Unity Target</th>
                <th>Exact Simplification Rule</th>
                <th>Scope</th>
              </tr>
            </thead>
            <tbody>
              ${hooks
                .map(
                  (hk) => `
                <tr>
                  <td><strong style="color:var(--gold-bright);">${esc(hk.layer)}</strong></td>
                  <td><code>${esc(hk.d2Source)}</code></td>
                  <td><code>${esc(hk.bcTarget)}</code></td>
                  <td>${esc(hk.changeSummary)}</td>
                  <td><span class="grade-pill ok">${esc(hk.complexity)}</span></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    wrap.innerHTML = `
      <div class="matrix-hero-sync-banner">
        <div class="mhs-left">
          <img src="${esc(heroMeta.portrait)}" alt="${esc(heroMeta.name)}" />
          <div>
            <div class="mhs-title">⚖️ Blood Crown Master Game Matrix — Synced with ${esc(heroMeta.name)} · "${esc(build.name)}"</div>
            <div class="mhs-sub">
              Active Skill: <strong>${esc(sk.name)}</strong>${activeMod ? ` [⚡ ${esc(activeMod.name.split("(")[0].trim())}]` : ""} ·
              Weapon: <strong>${esc(curWmb ? curWmb.name : sim.weaponName)}</strong> ·
              Pacing Score: <strong style="color:#6cf0a6;">${pacing.paceDistance.toFixed(3)} (${pacing.inBoxCount}/15 IN BOX)</strong>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-gold" id="btnMatrixTestInArena">🎬 Test Setup in Live Arena</button>
          <button type="button" class="btn btn-sm btn-outline" id="btnMatrixExportTsv">⬇️ Export 99-Lvl TSV</button>
          <button type="button" class="btn btn-sm btn-outline" id="btnMatrixBackToForge">← Back to Skill Forge</button>
        </div>
      </div>

      <div class="matrix-subtabs">
        <button type="button" class="matrix-subtab-btn ${subTab === "combat" ? "active" : ""}" data-mat-subtab="combat">⚔️ 1. Live Combat, HTK &amp; 6-Line Tooltip</button>
        <button type="button" class="matrix-subtab-btn ${subTab === "pacing" ? "active" : ""}" data-mat-subtab="pacing">📏 2. 15-Row Two-Box Pacing Meter (${pacing.inBoxCount}/15)</button>
        <button type="button" class="matrix-subtab-btn ${subTab === "oracle" ? "active" : ""}" data-mat-subtab="oracle">📊 3. D2R 2,000-Run Oracle vs Blood Crown</button>
        <button type="button" class="matrix-subtab-btn ${subTab === "rules" ? "active" : ""}" data-mat-subtab="rules">🧭 4. 9 Plain-English Rules &amp; 6 Engine Hooks</button>
      </div>

      ${bodyHtml}
    `;

    wrap.querySelectorAll("[data-mat-subtab]").forEach((btn) =>
      btn.addEventListener("click", () => {
        matrixState.subTab = btn.dataset.matSubtab;
        renderMatrixWorkspace();
      })
    );

    const btnTestArena = document.getElementById("btnMatrixTestInArena");
    if (btnTestArena) {
      btnTestArena.addEventListener("click", () => {
        resetArenaDummies();
        if (isMobileViewport()) {
          setMobileTab("arena");
        } else {
          setActiveMode("builds");
        }
        triggerSkillPreview(sk.id, false);
      });
    }
    const btnExportTsv = document.getElementById("btnMatrixExportTsv");
    if (btnExportTsv) {
      btnExportTsv.addEventListener("click", downloadMonsterCurveTsv);
    }
    const btnBackForge = document.getElementById("btnMatrixBackToForge");
    if (btnBackForge) {
      btnBackForge.addEventListener("click", () => {
        if (isMobileViewport()) setMobileTab("tree");
        else setActiveMode("builds");
      });
    }

    const lvlSlider = document.getElementById("matLevelSlider");
    if (lvlSlider) {
      lvlSlider.addEventListener("input", (e) => {
        matrixState.level = parseInt(e.target.value, 10) || 30;
        resetArenaDummies();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      });
    }
    wrap.querySelectorAll("[data-mat-lvl]").forEach((b) =>
      b.addEventListener("click", () => {
        matrixState.level = parseInt(b.dataset.matLvl, 10) || 30;
        resetArenaDummies();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      })
    );
    wrap.querySelectorAll("[data-mat-gear]").forEach((b) =>
      b.addEventListener("click", () => {
        matrixState.gearTier = b.dataset.matGear;
        renderArenaCombatTelemetry();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      })
    );
    wrap.querySelectorAll("[data-mat-tier]").forEach((b) =>
      b.addEventListener("click", () => {
        matrixState.targetTier = b.dataset.matTier;
        resetArenaDummies();
        renderSkillBreakdown();
        renderMatrixWorkspace();
      })
    );
    const wpnSel = document.getElementById("matWeaponSelect");
    if (wpnSel) {
      wpnSel.addEventListener("change", (e) => {
        setWeaponArchetypeOnActiveBuild(e.target.value);
        renderMatrixWorkspace();
      });
    }
    wrap.querySelectorAll("[data-mat-mod]").forEach((b) =>
      b.addEventListener("click", () => {
        setSkillModifierOnActiveBuild(sk.id, b.dataset.matMod || "");
        renderMatrixWorkspace();
      })
    );
    wrap.querySelectorAll("[data-pacing-slider]").forEach((sl) =>
      sl.addEventListener("input", (e) => {
        const rid = sl.dataset.pacingSlider;
        matrixState.pacingOverrides[rid] = parseFloat(e.target.value);
        renderArenaCombatTelemetry();
        renderMatrixWorkspace();
      })
    );
    const btnResetPacing = document.getElementById("btnResetPacingSliders");
    if (btnResetPacing) {
      btnResetPacing.addEventListener("click", () => {
        matrixState.pacingOverrides = {};
        renderArenaCombatTelemetry();
        renderMatrixWorkspace();
        showToast("↺ Restored all 15 Pacing Rows to Blood Crown 15/15 IN-BOX baseline!");
      });
    }
  }

  function renderAll() {
    syncWorkspaceLayout();
    renderHeroSelect();
    renderSkillPalette();
    renderBuildLoadoutDock();
    renderSkillTree();
    renderBuildComboStage();
    renderSkillBreakdown();
    renderCodexWorkspace();
    renderMatrixWorkspace();
    renderArenaCombatTelemetry();
    renderMobileChrome();
  }

  // Boot
  const importedFromUrl = hydrateUrlParameters();
  registerPwaServiceWorker();
  resetArenaDummies();
  bindEvents();
  renderAll();
  triggerSkillPreview(currentHeroState().selectedSkillId, true);
  hydrateFromServerIfNewer(importedFromUrl);
  requestAnimationFrame(tickArena);
})();
