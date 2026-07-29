"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type AppMode = "atlas" | "lernen";
type OverviewMode = "clean" | "annotated";

type Detail = {
  id: number;
  label: string;
  atlas: string;
  exam: string;
  clue: string;
};

type HierarchyItem = {
  title: string;
  number: string;
  note?: string;
  href?: string;
};

type ExamRepresentativeImage = {
  annotation_id: number;
  label: string;
  exercise_image: string;
  rationale: string;
};

type CourseRecord = {
  number: string;
  slug?: string;
  name?: string;
  organ: string;
  diagnosis: string;
  description?: string | string[];
  url?: string;
  source_url?: string;
  overview?: string;
  atlas_overview?: string;
  examImage?: string;
  exam_representative_images?: ExamRepresentativeImage[];
  annotations?: AtlasAnnotation[];
};

type ExamAnswer = {
  record: CourseRecord;
  organAnswer: string;
  diagnosisAnswer: string;
  organPoint: number;
  diagnosisPoints: number;
};

type CourseData = {
  records: CourseRecord[];
};

type AtlasAnnotation = {
  id: number;
  label: string;
  atlas_image: string;
  exercise_image: string;
  didactic_note?: string;
};

type AtlasIndex = {
  schema_version: number;
  preparation_count: number;
  preparations: CourseRecord[];
};

function relativeAssetPath(path?: string) {
  return path?.startsWith("/") ? `.${path}` : path;
}

function normalizeRecordAssets(record: CourseRecord): CourseRecord {
  return {
    ...record,
    overview: relativeAssetPath(record.overview),
    atlas_overview: relativeAssetPath(record.atlas_overview),
    examImage: relativeAssetPath(record.examImage),
    annotations: record.annotations?.map((annotation) => ({
      ...annotation,
      atlas_image: relativeAssetPath(annotation.atlas_image) ?? "",
      exercise_image: relativeAssetPath(annotation.exercise_image) ?? "",
    })),
    exam_representative_images: record.exam_representative_images?.map(
      (image) => ({
        ...image,
        exercise_image: relativeAssetPath(image.exercise_image) ?? "",
      }),
    ),
  };
}

type HierarchyLevel = {
  step: string;
  category: string;
  principle: string;
  tone: string;
  items: HierarchyItem[];
  emptyText: string;
};

type OrganSystem = {
  id: string;
  name: string;
  learningFocus: string;
  organs: string[];
};

const ASSET_ROOT = "atlas/001-kolon";

const ORGAN_SYSTEMS: OrganSystem[] = [
  {
    id: "gastrointestinaltrakt",
    name: "Gastrointestinaltrakt",
    learningFocus: "Schleimhaut, Drüsenarchitektur und invasive Tumoren",
    organs: [
      "Ösophagus/ösophagogastraler Übergang",
      "Magen",
      "Kolon",
      "Appendix",
      "Leber",
      "Gallenblase",
      "Pankreas",
      "Peritoneum und Subserosa",
    ],
  },
  {
    id: "atmung-kopf-hals",
    name: "Atmungssystem und Kopf-/Halsregion",
    learningFocus: "Atemwege, Lungenparenchym und Plattenepithel",
    organs: ["Nasennebenhöhlen", "Zunge", "Respirationstrakt", "Lunge"],
  },
  {
    id: "herz-kreislauf",
    name: "Herz-Kreislauf-System",
    learningFocus: "Myokardschädigung, Entzündung und Gefäßpathologie",
    organs: ["Herz", "Perikard", "Gefäßsystem"],
  },
  {
    id: "harnsystem",
    name: "Harnsystem",
    learningFocus: "Glomerulum, Interstitium und Nierentumoren",
    organs: ["Niere"],
  },
  {
    id: "maennliches-genitale",
    name: "Männliches Genitale",
    learningFocus: "Prostata und ihre malignen Veränderungen",
    organs: ["Prostata"],
  },
  {
    id: "weibliches-genitale",
    name: "Weibliches Genitale",
    learningFocus: "Zervikale Vorstufen, Uterus und Ovar",
    organs: ["Cervix", "Uterus", "Ovar"],
  },
  {
    id: "mamma",
    name: "Mamma",
    learningFocus: "In-situ-Läsionen und invasive Karzinome",
    organs: ["Mamma"],
  },
  {
    id: "endokrines-system",
    name: "Endokrines System",
    learningFocus: "Schilddrüse, Nebenschilddrüse und Nebenniere",
    organs: [
      "Nebennniere",
      "Nebenschilddrüse",
      "Nebenschilddrüse & Schilddrüse",
    ],
  },
  {
    id: "haut-weichgewebe",
    name: "Haut und Weichgewebe",
    learningFocus: "Epitheliale, mesenchymale und reaktive Läsionen",
    organs: [
      "Haut",
      "Haut und subcutanes Weichgewebe",
      "Fettgewebe/Weichgewebe",
      "Weichgewebe",
      "periarticuläres Weichgewebe",
      "quergestreifte Muskulatur",
    ],
  },
  {
    id: "bewegungsapparat",
    name: "Bewegungsapparat",
    learningFocus: "Knochen, Gelenk und kristallbedingte Erkrankungen",
    organs: ["Knochen", "Synovia", "Zehe"],
  },
  {
    id: "lymphatisches-system",
    name: "Lymphatisches und hämatopoetisches System",
    learningFocus: "Entzündung, Metastasen und Lymphome",
    organs: ["Lymphknoten"],
  },
];

const details: Detail[] = [
  {
    id: 11,
    label: "Krypte mit Becherzellen",
    atlas: `${ASSET_ROOT}/atlas/11-krypte-mit-becherzellen-annotiert.jpg`,
    exam: `${ASSET_ROOT}/pruefung/11-krypte-mit-becherzellen.jpg`,
    clue:
      "Gerade Drüse, zahlreiche helle Muzinvakuolen und basalständige Zellkerne.",
  },
  {
    id: 7,
    label: "Auerbach-Plexus",
    atlas: `${ASSET_ROOT}/atlas/07-auerbach-plexus-annotiert.jpg`,
    exam: `${ASSET_ROOT}/pruefung/07-auerbach-plexus.jpg`,
    clue:
      "Ganglienzellen und Nervenfasern zwischen Ring- und Längsmuskulatur.",
  },
  {
    id: 16,
    label: "Stratum circulare",
    atlas: `${ASSET_ROOT}/atlas/16-stratum-circulare-annotiert.jpg`,
    exam: `${ASSET_ROOT}/pruefung/16-stratum-circulare.jpg`,
    clue:
      "Glatte Muskulatur der inneren Ringmuskelschicht im Quer- oder Schrägschnitt.",
  },
  {
    id: 15,
    label: "Stratum longitudinale",
    atlas: `${ASSET_ROOT}/atlas/15-stratum-longitudinale-annotiert.jpg`,
    exam: `${ASSET_ROOT}/pruefung/15-stratum-longitudinale.jpg`,
    clue:
      "Äußere Längsmuskulatur mit längs getroffenen glatten Muskelzellen.",
  },
  {
    id: 14,
    label: "Perikolisches Fettgewebe",
    atlas: `${ASSET_ROOT}/atlas/14-perikolisches-fettgewebe-annotiert.jpg`,
    exam: `${ASSET_ROOT}/pruefung/14-perikolisches-fettgewebe.jpg`,
    clue: "Reife univakuoläre Adipozyten außen an der Darmwand.",
  },
  {
    id: 17,
    label: "Lymphfollikel",
    atlas: `${ASSET_ROOT}/atlas/17-lymphfollikel-annotiert.jpg`,
    exam: `${ASSET_ROOT}/pruefung/17-lymphfollikel.jpg`,
    clue:
      "Dichtes lymphatisches Aggregat; im Kolon als Begleitbefund möglich.",
  },
];

const hierarchyDefinitions = [
  {
    step: "01",
    category: "Physiologische Referenz",
    principle: "Normale Architektur und Zelltypen sicher identifizieren",
    tone: "reference",
    emptyText: "Im Kurs ist für dieses Organ kein Referenzpräparat vorhanden.",
  },
  {
    step: "02",
    category: "Entzündlich / degenerativ",
    principle: "Schädigung, Zelluntergang und reaktive Veränderungen erkennen",
    tone: "reactive",
    emptyText:
      "Im Kurs ist für dieses Organ kein entzündliches oder degeneratives Präparat vorhanden.",
  },
  {
    step: "03",
    category: "Präkanzerogen / benigne",
    principle: "Vorstufen und benigne Neoplasien von Invasion abgrenzen",
    tone: "precancer",
    emptyText:
      "Im Kurs ist für dieses Organ kein präkanzerogenes oder benignes Präparat vorhanden.",
  },
  {
    step: "04",
    category: "Maligne Tumoren",
    principle: "Infiltratives Wachstum und Ausdehnung beurteilen",
    tone: "malignant",
    emptyText:
      "Im Kurs ist für dieses Organ kein maligner Primärtumor vorhanden.",
  },
  {
    step: "05",
    category: "Fernmetastasen anderer Tumoren",
    principle: "Organfremden Primärtumor vom lokalen Primarius unterscheiden",
    tone: "metastasis",
    emptyText:
      "Im Kurs ist für dieses Organ kein Fernmetastasenpräparat vorhanden.",
  },
] as const;

function classifyDiagnosis(diagnosis: string) {
  const value = normalizeAnswer(diagnosis);

  if (value === "referenz") return 0;
  if (
    value.includes("metastase") ||
    value.includes("krukenberg") ||
    value.includes("peritonealkarzinose")
  ) {
    return 4;
  }
  if (
    value.includes("in situ") ||
    value.includes("cin ") ||
    value.includes("dysplasie") ||
    value.includes("adenom") ||
    value.includes("lipom") ||
    value.includes("naevus") ||
    value.includes("keratose") ||
    value.includes("hamangiom") ||
    value.includes("chondrom") ||
    value.includes("leiomyom") ||
    value.includes("metaplasie") ||
    value.includes("barrett-mukosa") ||
    value.includes("struma")
  ) {
    return 2;
  }
  if (
    value.includes("karzinom") ||
    value.includes("carcinom") ||
    value.includes("sarkom") ||
    value.includes("lymphom")
  ) {
    return 3;
  }
  return 1;
}

function buildOrganHierarchy(
  organ: string,
  records: CourseRecord[],
): HierarchyLevel[] {
  const organRecords = records.filter((record) => record.organ === organ);

  return hierarchyDefinitions.map((definition, categoryIndex) => {
    const items = organRecords
      .filter(
        (record) => classifyDiagnosis(record.diagnosis) === categoryIndex,
      )
      .map((record) => {
        return {
          title:
            record.diagnosis === "Referenz"
              ? `Normales ${organ}`
              : record.diagnosis,
          number: record.number,
          note:
            record.diagnosis !== "Referenz" &&
            record.name &&
            normalizeAnswer(record.name) !== normalizeAnswer(record.diagnosis)
              ? record.name
              : undefined,
          href: record.overview ? `#praeparat-${record.number}` : undefined,
        };
      });

    return {
      ...definition,
      items,
    };
  });
}

const comparisonRows = [
  {
    name: "Normal",
    number: "#001",
    architecture: "Gerade, regelmäßige Krypten; normale Wandschichtung",
    cells: "Viele Becherzellen; keine Dysplasie",
    invasion: "Keine",
    signal: "Referenzbild",
    tone: "reference",
  },
  {
    name: "GvHD",
    number: "#013",
    architecture: "Kryptenuntergang und ödematöse Auflockerung",
    cells: "Apoptosen im Kryptenepithel",
    invasion: "Keine neoplastische Invasion",
    signal: "Schädigung statt Tumor",
    tone: "reactive",
  },
  {
    name: "Adenom",
    number: "#073",
    architecture: "Polypös, tubulovillös; verzweigte Drüsen",
    cells: "Mehrreihig und dysplastisch; geringe Dysplasie polar",
    invasion: "Nein",
    signal: "Dysplasie ohne Invasion",
    tone: "precancer",
  },
  {
    name: "Adeno-Ca",
    number: "#074 / #086",
    architecture: "Irreguläre Drüsen mit infiltrierendem Tiefenwachstum",
    cells: "Mitosen, Hyperchromasie, Nukleolen, Polaritätsverlust",
    invasion: "Ja · pT2 bis pT4",
    signal: "Invasion entscheidet",
    tone: "malignant",
  },
];

const nextColonPreparations = [
  {
    step: "02",
    group: "Entzündlich / degenerativ",
    number: "013",
    title: "Graft-versus-Host-Reaktion",
    focus: "Kryptenapoptosen und Schleimhautschädigung",
  },
  {
    step: "03",
    group: "Präkanzerogen / benigne",
    number: "073",
    title: "Tubulovillöses Kolonadenom",
    focus: "Dysplasie ohne invasives Wachstum",
  },
  {
    step: "04",
    group: "Maligne Tumoren",
    number: "074",
    title: "Adenokarzinom des Kolons · pT2",
    focus: "Invasion in die Tunica muscularis",
  },
  {
    step: "04",
    group: "Maligne Tumoren",
    number: "086",
    title: "Adenokarzinom des Kolons · pT4",
    focus: "Serosadurchbruch und fortgeschrittene Invasion",
  },
];

function ZoomViewer({
  src,
  alt,
  compact = false,
  maxZoom = 320,
}: {
  src: string;
  alt: string;
  compact?: boolean;
  maxZoom?: number;
}) {
  const [zoom, setZoom] = useState(100);
  const [dragging, setDragging] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    setZoom(100);
    if (stageRef.current) {
      stageRef.current.scrollTo({ left: 0, top: 0 });
    }
  }, [src]);

  function startDragging(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !stageRef.current) return;
    const stage = stageRef.current;
    dragState.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: stage.scrollLeft,
      scrollTop: stage.scrollTop,
    };
    stage.setPointerCapture(event.pointerId);
    setDragging(true);
    event.preventDefault();
  }

  function moveImage(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current.active || !stageRef.current) return;
    stageRef.current.scrollLeft =
      dragState.current.scrollLeft -
      (event.clientX - dragState.current.startX);
    stageRef.current.scrollTop =
      dragState.current.scrollTop -
      (event.clientY - dragState.current.startY);
  }

  function stopDragging(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current.active) return;
    dragState.current.active = false;
    if (stageRef.current?.hasPointerCapture(event.pointerId)) {
      stageRef.current.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  return (
    <div className={`zoom-viewer ${compact ? "compact" : ""}`}>
      <div className="zoom-toolbar" aria-label="Bildzoom">
        <span className="zoom-status">{zoom}%</span>
        <input
          aria-label="Zoomstufe"
          type="range"
          min="60"
          max={maxZoom}
          step="20"
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
        />
        <button
          type="button"
          aria-label="Verkleinern"
          onClick={() => setZoom((value) => Math.max(60, value - 20))}
        >
          −
        </button>
        <button
          type="button"
          aria-label="Vergrößern"
          onClick={() => setZoom((value) => Math.min(maxZoom, value + 20))}
        >
          +
        </button>
        <button type="button" onClick={() => setZoom(100)}>
          Zurücksetzen
        </button>
      </div>
      <div
        ref={stageRef}
        className={`zoom-stage ${dragging ? "dragging" : ""}`}
        tabIndex={0}
        aria-label="Mikroskopiebild. Zum Verschieben mit Maus oder Finger ziehen."
        onPointerDown={startDragging}
        onPointerMove={moveImage}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          style={{ width: `${zoom}%` }}
        />
      </div>
    </div>
  );
}

function normalizeAnswer(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("de")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getAvailableOrganSystems(records: CourseRecord[]) {
  const availableOrgans = new Set(records.map((record) => record.organ));
  const mappedOrgans = new Set(ORGAN_SYSTEMS.flatMap((system) => system.organs));
  const systems = ORGAN_SYSTEMS.map((system) => ({
    ...system,
    organs: system.organs.filter((organ) => availableOrgans.has(organ)),
  })).filter((system) => system.organs.length > 0);
  const unmappedOrgans = Array.from(availableOrgans)
    .filter((organ) => !mappedOrgans.has(organ))
    .sort((a, b) => a.localeCompare(b, "de"));

  if (unmappedOrgans.length > 0) {
    systems.push({
      id: "weitere-organe",
      name: "Weitere Organe",
      learningFocus: "Weitere Präparate des Kurskatalogs",
      organs: unmappedOrgans,
    });
  }

  return systems;
}

function countPreparations(organ: string, records: CourseRecord[]) {
  return records.filter((record) => record.organ === organ).length;
}

function preparationCountLabel(count: number) {
  return `${count} ${count === 1 ? "Präparat" : "Präparate"}`;
}

function countDiagnoses(organ: string, records: CourseRecord[]) {
  return new Set(
    records
      .filter(
        (record) =>
          record.organ === organ &&
          normalizeAnswer(record.diagnosis) !== "referenz",
      )
      .map((record) => normalizeAnswer(record.diagnosis)),
  ).size;
}

function diagnosisCountLabel(organ: string, records: CourseRecord[]) {
  const count = countDiagnoses(organ, records);
  return `${count} ${count === 1 ? "Diagnose" : "Diagnosen"}`;
}

function FilterCombobox({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = `options-${label.toLocaleLowerCase("de")}`;

  const filteredOptions = useMemo(() => {
    const query = normalizeAnswer(value);
    if (!query) return options;
    return options.filter((option) => normalizeAnswer(option).includes(query));
  }, [options, value]);

  function selectOption(option: string) {
    onChange(option);
    setOpen(false);
    setActiveIndex(0);
  }

  return (
    <div className="combobox-field">
      <label htmlFor={`input-${listId}`}>{label}</label>
      <div className="combobox">
        <input
          id={`input-${listId}`}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={
            open && filteredOptions[activeIndex]
              ? `${listId}-${activeIndex}`
              : undefined
          }
          placeholder={`${label} eingeben oder auswählen`}
          autoComplete="off"
          value={value}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              setActiveIndex((index) =>
                Math.min(index + 1, Math.max(0, filteredOptions.length - 1)),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(0, index - 1));
            } else if (
              event.key === "Enter" &&
              open &&
              filteredOptions[activeIndex]
            ) {
              event.preventDefault();
              selectOption(filteredOptions[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          aria-label={`${label}-Liste öffnen`}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Schließen" : "Alle"}
        </button>
        {open && !disabled && (
          <ul id={listId} role="listbox">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={option === value}
                  className={index === activeIndex ? "active" : ""}
                  key={option}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectOption(option);
                  }}
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="empty-option">Keine passende Auswahl</li>
            )}
          </ul>
        )}
      </div>
      <small>
        {value
          ? `${filteredOptions.length} passende Einträge`
          : `${options.length} Einträge im Kurs`}
      </small>
    </div>
  );
}

function Header({
  mode,
  setMode,
  organSystems,
  records,
  selectedOrgan,
  activePreparation,
  selectOrgan,
  selectPreparation,
  showOverview,
}: {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  organSystems: OrganSystem[];
  records: CourseRecord[];
  selectedOrgan: string | null;
  activePreparation: CourseRecord | null;
  selectOrgan: (organ: string) => void;
  selectPreparation: (record: CourseRecord) => void;
  showOverview: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [organQuery, setOrganQuery] = useState("");
  const [preparationQuery, setPreparationQuery] = useState("");
  const [preparationSearchOpen, setPreparationSearchOpen] =
    useState(false);
  const [activePreparationIndex, setActivePreparationIndex] = useState(0);
  const filteredSystems = useMemo(() => {
    const query = normalizeAnswer(organQuery);
    if (!query) return organSystems;

    return organSystems
      .map((system) => {
        const systemMatches = normalizeAnswer(system.name).includes(query);
        return {
          ...system,
          organs: systemMatches
            ? system.organs
            : system.organs.filter((organ) =>
                normalizeAnswer(organ).includes(query),
              ),
        };
      })
      .filter((system) => system.organs.length > 0);
  }, [organQuery, organSystems]);
  const matchingPreparations = useMemo(() => {
    const query = normalizeAnswer(preparationQuery).replace(/^#/, "");
    if (!query) return records;

    return records
      .filter((record) =>
        normalizeAnswer(
          [
            record.number,
            record.name,
            record.diagnosis,
            record.organ,
          ]
            .filter(Boolean)
            .join(" "),
        ).includes(query),
      );
  }, [preparationQuery, records]);

  function chooseOrgan(organ: string) {
    selectOrgan(organ);
    setMode("atlas");
    setMenuOpen(false);
    setOrganQuery("");
    setPreparationQuery("");
    setPreparationSearchOpen(false);
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  function choosePreparation(record: CourseRecord) {
    selectPreparation(record);
    setMenuOpen(false);
    setOrganQuery("");
    setPreparationQuery("");
    setPreparationSearchOpen(false);
  }

  function chooseOverview() {
    showOverview();
    setMode("atlas");
    setMenuOpen(false);
    setOrganQuery("");
    setPreparationQuery("");
    setPreparationSearchOpen(false);
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    );
  }

  function openNavigation() {
    setPreparationSearchOpen(false);
    setActivePreparationIndex(0);
    setMenuOpen(true);
  }

  const headerOrgan =
    mode === "lernen"
      ? "Prüfungsmodus"
      : selectedOrgan || "Organsysteme";
  const headerPreparation =
    mode === "atlas" && activePreparation
      ? `Aktuell · #${activePreparation.number} · ${diagnosisForRecord(activePreparation)}`
      : null;
  const headerLocation = [headerOrgan, headerPreparation]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <button
            type="button"
            className="organ-menu-button"
            aria-label="Organübersicht öffnen"
            aria-expanded={menuOpen}
            aria-controls="organ-navigation"
            onClick={openNavigation}
          >
            <span />
            <span />
            <span />
          </button>
          <button
            type="button"
            className="brand-home"
            onClick={chooseOverview}
            aria-label="Zur Organsystem-Übersicht"
          >
            <strong>Histopathologie-Atlas</strong>
            <span className="brand-location" title={headerLocation}>
              <small className="brand-organ">{headerOrgan}</small>
              {headerPreparation && (
                <small className="brand-preparation">
                  {headerPreparation}
                </small>
              )}
            </span>
          </button>
        </div>
        <nav className="mode-switch" aria-label="Hauptnavigation">
          <button
            type="button"
            className={mode === "atlas" ? "active" : ""}
            onClick={() => setMode("atlas")}
          >
            Atlas
          </button>
          <button
            type="button"
            className={mode === "lernen" ? "active" : ""}
            onClick={() => setMode("lernen")}
          >
            Prüfungsmodus
          </button>
        </nav>
        <span className="local-badge">
          <i />
          lokal & offlinefähig
        </span>
      </header>

      {menuOpen && (
        <div
          className="organ-navigation-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <aside
            className="organ-navigation"
            id="organ-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Organ auswählen"
          >
            <div className="organ-navigation-head">
              <div>
                <p className="eyebrow">Kursnavigation</p>
                <h2>Atlas durchsuchen</h2>
              </div>
              <button type="button" onClick={() => setMenuOpen(false)}>
                Schließen
              </button>
            </div>
            <div className="preparation-navigation-search">
              <label htmlFor="preparation-search">
                Präparat nach Nummer oder Namen
              </label>
              <div className="combobox preparation-search-combobox">
                <input
                  id="preparation-search"
                  type="search"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={preparationSearchOpen}
                  aria-controls="preparation-search-results"
                  autoComplete="off"
                  placeholder="z. B. 045, Barrett oder Amyloidose"
                  value={preparationQuery}
                  onFocus={() => setPreparationSearchOpen(true)}
                  onBlur={() =>
                    window.setTimeout(
                      () => setPreparationSearchOpen(false),
                      120,
                    )
                  }
                  onChange={(event) => {
                    setPreparationQuery(event.target.value);
                    setPreparationSearchOpen(true);
                    setActivePreparationIndex(0);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setPreparationSearchOpen(true);
                      setActivePreparationIndex((index) =>
                        Math.min(
                          index + 1,
                          Math.max(0, matchingPreparations.length - 1),
                        ),
                      );
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault();
                      setActivePreparationIndex((index) =>
                        Math.max(0, index - 1),
                      );
                    } else if (
                      event.key === "Enter" &&
                      preparationSearchOpen &&
                      matchingPreparations[activePreparationIndex]
                    ) {
                      event.preventDefault();
                      choosePreparation(
                        matchingPreparations[activePreparationIndex],
                      );
                    } else if (event.key === "Escape") {
                      setPreparationSearchOpen(false);
                    }
                  }}
                />
                <button
                  type="button"
                  aria-label="Präparatliste öffnen"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    setPreparationSearchOpen((current) => !current)
                  }
                >
                  {preparationSearchOpen ? "Schließen" : "Alle"}
                </button>
                {preparationSearchOpen && (
                  <ul
                    id="preparation-search-results"
                    className="preparation-search-results"
                    role="listbox"
                    aria-label="Passende Präparate"
                  >
                    {matchingPreparations.length > 0 ? (
                      matchingPreparations.map((record, index) => (
                        <li
                          role="option"
                          aria-selected={index === activePreparationIndex}
                          className={
                            index === activePreparationIndex ? "active" : ""
                          }
                          key={record.number}
                          onMouseEnter={() =>
                            setActivePreparationIndex(index)
                          }
                        >
                          <button
                            type="button"
                            onPointerDown={(event) => {
                              event.preventDefault();
                              choosePreparation(record);
                            }}
  onClick={(event) => {
    if (event.detail === 0) {
      choosePreparation(record);
    }
  }}
>
                            <span>
                              <b>#{record.number}</b>
                              <strong>
                                {record.name || diagnosisForRecord(record)}
                              </strong>
                            </span>
                            <small>
                              {record.organ} · {diagnosisForRecord(record)}
                            </small>
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="empty-preparation-result">
                        Kein Präparat mit dieser Nummer oder Bezeichnung
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <small>
                {preparationQuery
                  ? `${matchingPreparations.length} passende Präparate`
                  : `${records.length} Präparate im Kurs`}
              </small>
            </div>
            <label htmlFor="organ-search">Organ suchen</label>
            <input
              id="organ-search"
              type="search"
              placeholder="z. B. Lunge, Niere oder Magen"
              value={organQuery}
              onChange={(event) => setOrganQuery(event.target.value)}
            />
            <button
              type="button"
              className={`navigation-overview ${
                selectedOrgan === null ? "active" : ""
              }`}
              onClick={chooseOverview}
            >
              <span>Alle Organsysteme</span>
              <small>Zur Startseite</small>
            </button>
            <nav className="organ-list" aria-label="Organsysteme und Organe">
              {filteredSystems.map((system, systemIndex) => (
                <section className="navigation-system" key={system.id}>
                  <div className="navigation-system-title">
                    <span>{String(systemIndex + 1).padStart(2, "0")}</span>
                    <h3>{system.name}</h3>
                  </div>
                  <div className="navigation-organs">
                    {system.organs.map((organ) => (
                      <button
                        type="button"
                        className={organ === selectedOrgan ? "active" : ""}
                        key={organ}
                        onClick={() => chooseOrgan(organ)}
                      >
                        <span>{organ}</span>
                        <small>
                          {preparationCountLabel(
                            countPreparations(organ, records),
                          )}{" "}
                          ·{" "}
                          {diagnosisCountLabel(organ, records)}
                        </small>
                      </button>
                    ))}
                  </div>
                </section>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function SystemOverview({
  systems,
  records,
  selectOrgan,
}: {
  systems: OrganSystem[];
  records: CourseRecord[];
  selectOrgan: (organ: string) => void;
}) {
  return (
    <main className="systems-page" id="top">
      <section className="systems-hero">
        <p className="eyebrow">Histopathologie-Kursatlas</p>
        <h1>Organsysteme</h1>
        <p>
          Wähle zuerst das Organsystem und anschließend das Organ. Innerhalb
          jedes Organkapitels folgen die Präparate derselben diagnostischen
          Lernreihenfolge.
        </p>
      </section>

      <section className="systems-index" aria-label="Organsysteme im Kurs">
        {systems.map((system, index) => {
          const preparationCount = system.organs.reduce(
            (sum, organ) => sum + countPreparations(organ, records),
            0,
          );

          return (
            <article className="system-section" key={system.id}>
              <div className="system-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="system-heading">
                <p className="eyebrow">
                  {system.organs.length} Organe ·{" "}
                  {preparationCountLabel(preparationCount)}
                </p>
                <h2>{system.name}</h2>
                <p>{system.learningFocus}</p>
              </div>
              <div className="system-organs">
                {system.organs.map((organ) => (
                  <button
                    type="button"
                    key={organ}
                    onClick={() => {
                      selectOrgan(organ);
                      window.requestAnimationFrame(() =>
                        window.scrollTo({ top: 0, behavior: "smooth" }),
                      );
                    }}
                  >
                    <span>{organ}</span>
                    <small>
                      {preparationCountLabel(
                        countPreparations(organ, records),
                      )}{" "}
                      ·{" "}
                      {diagnosisCountLabel(organ, records)}
                    </small>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function OrganIntro({
  organ,
  records,
}: {
  organ: string;
  records: CourseRecord[];
}) {
  const organHierarchy = useMemo(
    () => buildOrganHierarchy(organ, records),
    [organ, records],
  );
  const preparationCount = organHierarchy.reduce(
    (sum, level) => sum + level.items.length,
    0,
  );

  return (
    <>
      <section className="organ-hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            Organkapitel · {preparationCount} Kurspräparate
          </p>
          <h1>{organ}</h1>
        </div>
      </section>

      <section className="section-shell organ-hierarchy" id="diagnosen">
        <div className="learning-path">
          {organHierarchy.map((level) => (
            <section
              className={`path-level ${level.tone} ${
                level.items.length === 0 ? "empty" : ""
              }`}
              key={level.step}
            >
              <div className="path-index">{level.step}</div>
              <div className="path-heading">
                <h3>{level.category}</h3>
                <p>{level.principle}</p>
              </div>
              <div className="path-items">
                {level.items.length > 0 ? (
                  level.items.map((item) =>
                    item.href ? (
                      <a
                        className="path-item available"
                        href={item.href}
                        key={`${item.number}-${item.title}`}
                      >
                        <span>
                          <strong>{item.title}</strong>
                          {item.note && <small>{item.note}</small>}
                        </span>
                        <b>Präparat {item.number}</b>
                        <i>Zum Präparat</i>
                      </a>
                    ) : (
                      <div
                        className="path-item pending"
                        key={`${item.number}-${item.title}`}
                      >
                        <span>
                          <strong>{item.title}</strong>
                          {item.note && <small>{item.note}</small>}
                        </span>
                        <b>Präparat {item.number}</b>
                      </div>
                    ),
                  )
                ) : (
                  <p className="path-empty">{level.emptyText}</p>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}

function Comparison() {
  return (
    <section className="section-shell comparison-section" id="vergleich">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Differentialdiagnose</p>
          <h2>Vier Muster · eine Entscheidungslogik</h2>
        </div>
        <p>
          Architektur → Zellbild → Invasion. In dieser Reihenfolge wird aus
          einem unbekannten Präparat eine belastbare Diagnose.
        </p>
      </div>
      <div className="comparison-table-wrap">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Muster</th>
              <th>Architektur</th>
              <th>Zellbild</th>
              <th>Invasion</th>
              <th>Prüfungssignal</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr className={row.tone} key={row.name}>
                <th scope="row">
                  <strong>{row.name}</strong>
                  <span>{row.number}</span>
                </th>
                <td>{row.architecture}</td>
                <td>{row.cells}</td>
                <td>{row.invasion}</td>
                <td>
                  <b>{row.signal}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="memory-line">
        <span>Merksatz</span>
        <p>
          GvHD <b>zerstört</b> Krypten, das Adenom <b>dysplastisiert</b> sie,
          das Adenokarzinom <b>durchbricht</b> die normale Architektur invasiv.
        </p>
      </div>
    </section>
  );
}

function ReferenceAtlas() {
  const [overviewMode, setOverviewMode] =
    useState<OverviewMode>("annotated");
  const [selectedDetail, setSelectedDetail] = useState<Detail | null>(null);

  const overviewSrc =
    overviewMode === "annotated"
      ? `${ASSET_ROOT}/uebersicht-atlas-annotiert.jpg`
      : `${ASSET_ROOT}/uebersicht-hochaufloesend.jpg`;

  return (
    <>
      <section className="reference-hero" id="praeparat-001">
        <div className="reference-title">
          <p className="eyebrow">Physiologische Referenz · Präparat 001</p>
          <h2>Normales Kolon</h2>
          <p>
            Die markierten Rahmen entsprechen exakt den sechs Ausschnitten, die
            darunter auf Zellniveau gezeigt werden.
          </p>
        </div>
        <div className="reference-stamp">
          <span>HE</span>
          <strong>Referenz</strong>
        </div>
      </section>

      <section className="overview-layout">
        <div className="overview-panel">
          <div className="segmented-control" aria-label="Übersichtsvariante">
            <button
              type="button"
              className={overviewMode === "clean" ? "active" : ""}
              onClick={() => setOverviewMode("clean")}
            >
              Leere Übersicht
            </button>
            <button
              type="button"
              className={overviewMode === "annotated" ? "active" : ""}
              onClick={() => setOverviewMode("annotated")}
            >
              Ausschnitte anzeigen
            </button>
          </div>
          <ZoomViewer
            src={overviewSrc}
            maxZoom={500}
            alt={
              overviewMode === "annotated"
                ? "Kolonübersicht mit exakt umrahmten Detailausschnitten"
                : "Annotationsfreie hochauflösende Kolonübersicht"
            }
          />
        </div>
        <aside className="recognition-card">
          <p className="eyebrow">So erkenne ich das Organ</p>
          <ol>
            <li>
              <span>01</span>
              <p>
                <b>Gerade Krypten</b>
                Dicht stehend, regelmäßig, ohne Zotten.
              </p>
            </li>
            <li>
              <span>02</span>
              <p>
                <b>Viele Becherzellen</b>
                Helle Muzinvakuolen im Kryptenepithel.
              </p>
            </li>
            <li>
              <span>03</span>
              <p>
                <b>Typische Darmwand</b>
                Ring- und Längsmuskulatur mit Auerbach-Plexus dazwischen.
              </p>
            </li>
            <li>
              <span>04</span>
              <p>
                <b>Außenschicht</b>
                Serosa und perikolisches Fettgewebe.
              </p>
            </li>
          </ol>
          <div className="diagnosis-callout">
            <span>Diagnose</span>
            <strong>Regelrechte Kolonwand</strong>
            <small>physiologisches Referenzpräparat</small>
          </div>
        </aside>
      </section>

      <section className="section-shell detail-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Zellniveau</p>
            <h2>Sechs Strukturen, die das Präparat verankern</h2>
          </div>
          <p>
            Nur der Name steht im Bild. Pfeile und Kreise wurden bewusst
            weggelassen.
          </p>
        </div>
        <div className="detail-grid">
          {details.map((detail) => (
            <button
              type="button"
              className="detail-card"
              key={detail.id}
              onClick={() => setSelectedDetail(detail)}
              aria-label={`${detail.label} vergrößern`}
            >
              <span className="detail-image">
                <img src={detail.atlas} alt={detail.label} />
                <i>vergrößern</i>
              </span>
              <span className="detail-copy">
                <strong>{detail.label}</strong>
                <span>{detail.clue}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="upcoming-preparations">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nächste Präparate</p>
            <h2>Das Kolonkapitel wird hier fortgesetzt</h2>
          </div>
          <p>
            Die weiteren Kurspräparate folgen in derselben Reihenfolge wie in
            der Lernhierarchie.
          </p>
        </div>
        <div className="upcoming-list">
          {nextColonPreparations.map((preparation) => (
            <article
              className="upcoming-item"
              key={`${preparation.number}-${preparation.title}`}
            >
              <span className="upcoming-step">{preparation.step}</span>
              <div>
                <small>{preparation.group}</small>
                <h3>{preparation.title}</h3>
                <p>{preparation.focus}</p>
              </div>
              <strong>Präparat {preparation.number}</strong>
              <i>Bildkapitel folgt</i>
            </article>
          ))}
        </div>
      </section>

      {selectedDetail && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedDetail.label}
        >
          <div className="lightbox-card">
            <div className="lightbox-head">
              <div>
                <small>Präparat 001 · Zellniveau</small>
                <strong>{selectedDetail.label}</strong>
              </div>
              <button type="button" onClick={() => setSelectedDetail(null)}>
                Schließen
              </button>
            </div>
            <ZoomViewer
              src={selectedDetail.atlas}
              alt={selectedDetail.label}
              compact
            />
            <p>{selectedDetail.clue}</p>
          </div>
        </div>
      )}
    </>
  );
}

function descriptionItems(record: CourseRecord) {
  if (Array.isArray(record.description)) {
    return record.description.filter(Boolean);
  }

  if (typeof record.description === "string") {
    return record.description
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function PreparationAtlas({ record }: { record: CourseRecord }) {
  const [overviewMode, setOverviewMode] =
    useState<OverviewMode>("annotated");
  const [selectedDetail, setSelectedDetail] =
    useState<AtlasAnnotation | null>(null);
  const annotations = record.annotations ?? [];
  const findings = descriptionItems(record);
  const category =
    hierarchyDefinitions[classifyDiagnosis(record.diagnosis)]?.category ??
    "Kurspräparat";
  const displayDiagnosis = diagnosisForRecord(record);
  const overviewSrc =
    overviewMode === "annotated"
      ? record.atlas_overview || record.overview
      : record.overview;

  if (!overviewSrc) return null;

  return (
    <article
      className="preparation-chapter"
      id={`praeparat-${record.number}`}
    >
      <section className="reference-hero">
        <div className="reference-title">
          <p className="eyebrow">
            {category} · Präparat {record.number}
          </p>
          <h2>
            {record.diagnosis === "Referenz"
              ? `Normales ${record.organ}`
              : record.name || displayDiagnosis}
          </h2>
          <p>
            Die markierten Rahmen in der Atlasübersicht entsprechen den{" "}
            {annotations.length} Ausschnitten, die darunter auf Zellniveau
            gezeigt werden.
          </p>
        </div>
        <div className="reference-stamp">
          <span>#{record.number}</span>
          <strong>{category}</strong>
        </div>
      </section>

      <section className="overview-layout">
        <div className="overview-panel">
          <div className="segmented-control" aria-label="Übersichtsvariante">
            <button
              type="button"
              className={overviewMode === "clean" ? "active" : ""}
              onClick={() => setOverviewMode("clean")}
            >
              Leere Übersicht
            </button>
            <button
              type="button"
              className={overviewMode === "annotated" ? "active" : ""}
              onClick={() => setOverviewMode("annotated")}
            >
              Ausschnitte anzeigen
            </button>
          </div>
          <ZoomViewer
            src={overviewSrc}
            maxZoom={500}
            alt={
              overviewMode === "annotated"
                ? `${displayDiagnosis}: Übersicht mit umrahmten Detailausschnitten`
                : `${displayDiagnosis}: annotationsfreie Übersicht`
            }
          />
        </div>

        <aside className="recognition-card">
          <p className="eyebrow">Histologische Merkmale</p>
          {findings.length > 0 ? (
            <ol>
              {findings.slice(0, 8).map((finding, index) => (
                <li key={`${record.number}-${index}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{finding.replace(/;$/, "")}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p>
              Nutze Übersicht und Detailausschnitte, um Organarchitektur und
              Zellbild systematisch zuzuordnen.
            </p>
          )}
          <div className="diagnosis-callout">
            <span>Diagnose</span>
            <strong>{displayDiagnosis}</strong>
            <small>Präparat {record.number}</small>
          </div>
        </aside>
      </section>

      <section className="section-shell detail-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Zellniveau</p>
            <h2>
              {annotations.length}{" "}
              {annotations.length === 1
                ? "relevanter Bildbereich"
                : "relevante Bildbereiche"}
            </h2>
          </div>
          <p>
            Im Bild steht nur der originale Annotationstext; Pfeile und Kreise
            wurden bewusst weggelassen.
          </p>
        </div>
        {annotations.length > 0 ? (
          <div className="detail-grid">
            {annotations.map((annotation) => (
              <button
                type="button"
                className="detail-card"
                key={annotation.id}
                onClick={() => setSelectedDetail(annotation)}
                aria-label={`${annotation.label} vergrößern`}
              >
                <span className="detail-image">
                  <img
                    src={annotation.atlas_image}
                    alt={annotation.label}
                    loading="lazy"
                    decoding="async"
                  />
                  <i>vergrößern</i>
                </span>
                <span className="detail-copy">
                  {annotation.didactic_note && (
                    <small>Didaktische Einordnung</small>
                  )}
                  <strong>{annotation.label}</strong>
                  {annotation.didactic_note && (
                    <span>{annotation.didactic_note}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="path-empty">
            Für dieses Präparat sind keine Annotationen hinterlegt.
          </p>
        )}
      </section>

      {selectedDetail && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedDetail.label}
        >
          <div className="lightbox-card">
            <div className="lightbox-head">
              <div>
                <small>Präparat {record.number} · Zellniveau</small>
                <strong>{selectedDetail.label}</strong>
              </div>
              <button type="button" onClick={() => setSelectedDetail(null)}>
                Schließen
              </button>
            </div>
            <ZoomViewer
              src={selectedDetail.atlas_image}
              alt={selectedDetail.label}
              compact
            />
            {selectedDetail.didactic_note && (
              <p className="lightbox-didactic">
                {selectedDetail.didactic_note}
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function OrganAtlas({
  organ,
  records,
}: {
  organ: string;
  records: CourseRecord[];
}) {
  const preparations = useMemo(
    () =>
      records
        .filter((record) => record.organ === organ && record.overview)
        .map((record, courseIndex) => ({ record, courseIndex }))
        .sort(
          (a, b) =>
            classifyDiagnosis(a.record.diagnosis) -
              classifyDiagnosis(b.record.diagnosis) ||
            a.courseIndex - b.courseIndex,
        )
        .map(({ record }) => record),
    [organ, records],
  );

  return (
    <>
      {preparations.map((record) => (
        <PreparationAtlas
          key={`${record.number}-${record.slug || record.name}`}
          record={record}
        />
      ))}
    </>
  );
}

function LegacyTrainingMode() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [organ, setOrgan] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState({ attempts: 0, correct: 0 });
  const [organOptions, setOrganOptions] = useState([
    "Kolon",
    "Appendix",
    "Magen",
    "Lunge",
    "Niere",
  ]);
  const [diagnosisOptions, setDiagnosisOptions] = useState([
    "Normales Kolon",
    "Graft-versus-Host-Reaktion",
    "Tubulovillöses Kolonadenom",
    "Adenokarzinom des Kolons",
  ]);

  const samples = useMemo(
    () => [
      {
        label: "Übersicht",
        exam: `${ASSET_ROOT}/uebersicht-hochaufloesend.jpg`,
        solution: `${ASSET_ROOT}/uebersicht-atlas-annotiert.jpg`,
        clue: "Achte zuerst auf Schleimhaut und Wandschichtung.",
      },
      ...details.map((detail) => ({
        label: "Zellniveau",
        exam: detail.exam,
        solution: detail.atlas,
        clue: detail.clue,
      })),
    ],
    [],
  );

  const sample = samples[sampleIndex];
  const organCorrect = normalizeAnswer(organ) === normalizeAnswer("Kolon");
  const diagnosisCorrect =
    normalizeAnswer(diagnosis) === normalizeAnswer("Normales Kolon");
  const bothCorrect = organCorrect && diagnosisCorrect;

  useEffect(() => {
    const saved = window.localStorage.getItem("histo-atlas-stats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {
        window.localStorage.removeItem("histo-atlas-stats");
      }
    }

    fetch("data/praeparate_kurs_3.json")
      .then((response) => response.json())
      .then((data: CourseData) => {
        const organs = Array.from(
          new Set(
            data.records
              .map((record) => record.organ.trim())
              .filter((value) => value.length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b, "de"));
        const diagnosesFromCourse = Array.from(
          new Set(
            data.records
              .map((record) =>
                record.diagnosis === "Referenz"
                  ? `Normales ${record.organ}`
                  : record.diagnosis.trim(),
              )
              .filter((value) => value.length > 0),
          ),
        ).sort((a, b) => a.localeCompare(b, "de"));
        setOrganOptions(organs);
        setDiagnosisOptions(diagnosesFromCourse);
      })
      .catch(() => {
        // Fallback lists above keep the training mode usable offline.
      });
  }, []);

  function submitAnswer() {
    if (!organ || !diagnosis || checked) return;
    const nextStats = {
      attempts: stats.attempts + 1,
      correct: stats.correct + (bothCorrect ? 1 : 0),
    };
    setStats(nextStats);
    window.localStorage.setItem("histo-atlas-stats", JSON.stringify(nextStats));
    setChecked(true);
  }

  function nextSample() {
    setSampleIndex((index) => (index + 1) % samples.length);
    setOrgan("");
    setDiagnosis("");
    setChecked(false);
  }

  const score =
    stats.attempts === 0 ? 0 : Math.round((stats.correct / stats.attempts) * 100);

  return (
    <main className="training-page" id="top">
      <section className="training-intro">
        <div>
          <p className="eyebrow">Prüfungsmodus · Präparat 001</p>
          <h1>Was siehst du?</h1>
          <p>
            Das Bild ist annotationsfrei. Entscheide zuerst das Organ und dann
            die Diagnose – genau wie in Prüfung und Mikroskop.
          </p>
        </div>
        <div className="score-card">
          <span>Lernstatistik auf diesem Gerät</span>
          <strong>{score}%</strong>
          <small>
            {stats.correct} von {stats.attempts} vollständig richtig
          </small>
        </div>
      </section>

      <section className="training-workspace">
        <div className="training-image-panel">
          <div className="training-image-head">
            <span>
              Unbekanntes Bild · <b>{sample.label}</b>
            </span>
            <span>
              {sampleIndex + 1} / {samples.length}
            </span>
          </div>
          <ZoomViewer
            src={checked ? sample.solution : sample.exam}
            alt={
              checked
                ? "Lösungsbild mit Annotationstext"
                : "Annotationsfreies Prüfungsbild"
            }
            compact
          />
        </div>

        <aside className="answer-panel">
          <p className="eyebrow">Deine Antwort</p>
          <FilterCombobox
            label="Organ"
            value={organ}
            options={organOptions}
            onChange={setOrgan}
            disabled={checked}
          />
          <FilterCombobox
            label="Diagnose"
            value={diagnosis}
            options={diagnosisOptions}
            onChange={setDiagnosis}
            disabled={checked}
          />

          {!checked ? (
            <>
              <p className="training-hint">{sample.clue}</p>
              <button
                type="button"
                className="primary-button"
                onClick={submitAnswer}
                disabled={!organ || !diagnosis}
              >
                Antwort prüfen
              </button>
            </>
          ) : (
            <div className={`result-card ${bothCorrect ? "correct" : "wrong"}`}>
              <span>{bothCorrect ? "Vollständig richtig" : "Noch nicht ganz"}</span>
              <h2>Kolon · normales Kolon</h2>
              <dl>
                <div>
                  <dt>Organ</dt>
                  <dd className={organCorrect ? "ok" : "no"}>
                    {organCorrect ? "richtig" : `deine Antwort: ${organ}`}
                  </dd>
                </div>
                <div>
                  <dt>Diagnose</dt>
                  <dd className={diagnosisCorrect ? "ok" : "no"}>
                    {diagnosisCorrect
                      ? "richtig"
                      : `deine Antwort: ${diagnosis}`}
                  </dd>
                </div>
              </dl>
              <p>
                Gerade Krypten ohne Zotten, viele Becherzellen und die
                regelrechte Darmwandschichtung sprechen für die physiologische
                Kolonreferenz.
              </p>
              <button type="button" onClick={nextSample}>
                Nächste Ansicht
              </button>
            </div>
          )}
        </aside>
      </section>

      <section className="training-note">
        <span>Lokaler Lernmodus</span>
        <p>
          Deine Statistik bleibt ausschließlich im Browser dieses Geräts. Die
          sechs Prüfungsbilder sind pixelgleich zu den Atlasdetails – nur ohne
          eingebrannte Beschriftung.
        </p>
      </section>
    </main>
  );
}

function diagnosisForRecord(record: CourseRecord) {
  return normalizeAnswer(record.diagnosis) === "referenz"
    ? `Normales ${record.organ}`
    : record.diagnosis;
}

function shuffleRecords(records: CourseRecord[]) {
  const shuffled = [...records];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

function ExamSlide({ record }: { record: CourseRecord }) {
  const cellImage =
    record.examImage ||
    record.annotations?.[0]?.exercise_image;

  if (record.overview || cellImage) {
    return (
      <div className="exam-slide-pair">
        {record.overview && (
          <section className="exam-slide-panel">
            <header>
              <span>Bild 01</span>
              <div>
                <strong>Übersichtsbild</strong>
                <small>Architektur und Organbezug</small>
              </div>
            </header>
            <ZoomViewer
              src={record.overview}
              maxZoom={800}
              alt="Annotationsfreie Übersicht des Prüfungspräparats"
              compact
            />
          </section>
        )}
        {cellImage && (
          <section className="exam-slide-panel">
            <header>
              <span>Bild 02</span>
              <div>
                <strong>Zellniveau</strong>
                <small>Diagnostisch relevanter Detailausschnitt</small>
              </div>
            </header>
            <ZoomViewer
              src={cellImage}
              alt="Annotationsfreier repräsentativer Zellbildausschnitt des Prüfungspräparats"
              compact
            />
          </section>
        )}
      </div>
    );
  }

  if (record.source_url || record.url) {
    return (
      <div className="remote-slide">
        <iframe
          src={record.source_url || record.url}
          title={`Virtuelles Mikroskopiepräparat ${record.number}`}
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <p>
          Virtuelles Originalpräparat · Navigation und Zoom erfolgen direkt im
          Mikroskopie-Viewer.
        </p>
      </div>
    );
  }

  return (
    <div className="exam-image-pending">
      <strong>Bild wird geladen</strong>
      <p>Für dieses Präparat sind noch keine lokalen Bilddaten verfügbar.</p>
    </div>
  );
}

function TrainingMode({ records }: { records: CourseRecord[] }) {
  const [phase, setPhase] = useState<"configure" | "exam" | "results">(
    "configure",
  );
  const [feedbackMode, setFeedbackMode] = useState<"exam" | "learn">("learn");
  const [questionCount, setQuestionCount] = useState(10);
  const [diagnosisWeight, setDiagnosisWeight] = useState<1 | 2>(1);
  const [includeReferences, setIncludeReferences] = useState(false);
  const [excludedOrgans, setExcludedOrgans] = useState<Set<string>>(new Set());
  const [examRecords, setExamRecords] = useState<CourseRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [organAnswer, setOrganAnswer] = useState("");
  const [diagnosisAnswer, setDiagnosisAnswer] = useState("");
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [currentFeedback, setCurrentFeedback] =
    useState<ExamAnswer | null>(null);

  const systems = useMemo(() => getAvailableOrganSystems(records), [records]);
  const allOrgans = useMemo(
    () =>
      Array.from(new Set(records.map((record) => record.organ))).sort((a, b) =>
        a.localeCompare(b, "de"),
      ),
    [records],
  );
  const eligibleRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          !excludedOrgans.has(record.organ) &&
          (includeReferences ||
            normalizeAnswer(record.diagnosis) !== "referenz"),
      ),
    [excludedOrgans, includeReferences, records],
  );
  const diagnosisOptions = useMemo(
    () =>
      Array.from(
        new Set(
          records
            .filter(
              (record) =>
                includeReferences ||
                normalizeAnswer(record.diagnosis) !== "referenz",
            )
            .map(diagnosisForRecord),
        ),
      ).sort((a, b) => a.localeCompare(b, "de")),
    [includeReferences, records],
  );
  const referenceRecordCount = records.filter(
    (record) => normalizeAnswer(record.diagnosis) === "referenz",
  ).length;
  const selectedOrganCount = allOrgans.length - excludedOrgans.size;
  const effectiveQuestionCount = Math.min(
    questionCount,
    eligibleRecords.length,
  );

  function toggleOrgan(organ: string) {
    setExcludedOrgans((current) => {
      const next = new Set(current);
      if (next.has(organ)) next.delete(organ);
      else next.add(organ);
      return next;
    });
  }

  function toggleSystem(system: OrganSystem) {
    const allSelected = system.organs.every(
      (organ) => !excludedOrgans.has(organ),
    );
    setExcludedOrgans((current) => {
      const next = new Set(current);
      system.organs.forEach((organ) => {
        if (allSelected) next.add(organ);
        else next.delete(organ);
      });
      return next;
    });
  }

  function startExam() {
    if (effectiveQuestionCount === 0) return;
    const selectedRecords = shuffleRecords(eligibleRecords)
      .slice(0, effectiveQuestionCount)
      .map((record) => {
        const images = record.exam_representative_images
          ?.map((representative) => representative.exercise_image)
          .filter(Boolean);
        const examImage =
          images && images.length > 0
            ? images[Math.floor(Math.random() * images.length)]
            : record.annotations?.[0]?.exercise_image || record.overview;

        return { ...record, examImage };
      });
    setExamRecords(selectedRecords);
    setCurrentIndex(0);
    setAnswers([]);
    setOrganAnswer("");
    setDiagnosisAnswer("");
    setCurrentFeedback(null);
    setPhase("exam");
    window.scrollTo({ top: 0 });
  }

  function submitExamAnswer() {
    const record = examRecords[currentIndex];
    if (!record || !organAnswer || !diagnosisAnswer || currentFeedback) return;

    const organPoint =
      normalizeAnswer(organAnswer) === normalizeAnswer(record.organ) ? 1 : 0;
    const diagnosisPoints =
      normalizeAnswer(diagnosisAnswer) ===
      normalizeAnswer(diagnosisForRecord(record))
        ? diagnosisWeight
        : 0;
    const submittedAnswer = {
      record,
      organAnswer,
      diagnosisAnswer,
      organPoint,
      diagnosisPoints,
    };
    const nextAnswers = [...answers, submittedAnswer];
    setAnswers(nextAnswers);

    if (feedbackMode === "learn") {
      setCurrentFeedback(submittedAnswer);
      return;
    }

    advanceToNextCase();
  }

  function advanceToNextCase() {
    if (currentIndex + 1 >= examRecords.length) {
      setCurrentFeedback(null);
      setPhase("results");
      window.scrollTo({ top: 0 });
      return;
    }

    setCurrentIndex((index) => index + 1);
    setOrganAnswer("");
    setDiagnosisAnswer("");
    setCurrentFeedback(null);
    window.scrollTo({ top: 0 });
  }

  function abortExam() {
    const confirmed = window.confirm(
      "Möchtest du die laufende Prüfung wirklich abbrechen? Die bisherigen Antworten werden verworfen.",
    );
    if (!confirmed) return;

    setExamRecords([]);
    setCurrentIndex(0);
    setAnswers([]);
    setOrganAnswer("");
    setDiagnosisAnswer("");
    setCurrentFeedback(null);
    setPhase("configure");
    window.scrollTo({ top: 0 });
  }

  if (phase === "configure") {
    return (
      <main className="exam-config-page" id="top">
        <section className="exam-config-hero">
          <p className="eyebrow">Prüfungsmodus</p>
          <h1>Prüfung konfigurieren</h1>
          <p>
            Wähle den Ablauf, den Umfang, die Punktegewichtung und den
            diagnostischen Bereich.
          </p>
        </section>

        <section className="exam-config-layout">
          <div className="exam-settings">
            <section className="config-block">
              <span className="config-number">01</span>
              <div>
                <h2>Prüfungsart</h2>
                <p>
                  Entscheide, ob Lösungen erst am Ende oder nach jedem Fall
                  erscheinen.
                </p>
              </div>
              <div className="weight-options exam-mode-options">
                <button
                  type="button"
                  className={feedbackMode === "learn" ? "active" : ""}
                  onClick={() => setFeedbackMode("learn")}
                >
                  <strong>Lernen</strong>
                  <small>Sofortige Rückmeldung und Lösung</small>
                </button>
                <button
                  type="button"
                  className={feedbackMode === "exam" ? "active" : ""}
                  onClick={() => setFeedbackMode("exam")}
                >
                  <strong>Klausur</strong>
                  <small>Keine Lösung zwischen den Fällen</small>
                </button>
              </div>
            </section>

            <section className="config-block">
              <span className="config-number">02</span>
              <div>
                <h2>Umfang</h2>
                <p>Standardmäßig werden zehn zufällige Präparate geprüft.</p>
              </div>
              <label className="question-count">
                <span>Anzahl der Präparate</span>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, eligibleRecords.length)}
                  value={questionCount}
                  onChange={(event) =>
                    setQuestionCount(
                      Math.max(1, Number(event.target.value) || 1),
                    )
                  }
                />
              </label>
            </section>

            <section className="config-block">
              <span className="config-number">03</span>
              <div>
                <h2>Punktegewichtung</h2>
                <p>Das Organ zählt immer einen Punkt.</p>
              </div>
              <div className="weight-options">
                <button
                  type="button"
                  className={diagnosisWeight === 1 ? "active" : ""}
                  onClick={() => setDiagnosisWeight(1)}
                >
                  <strong>1 + 1</strong>
                  <small>Organ 1 · Diagnose 1</small>
                </button>
                <button
                  type="button"
                  className={diagnosisWeight === 2 ? "active" : ""}
                  onClick={() => setDiagnosisWeight(2)}
                >
                  <strong>1 + 2</strong>
                  <small>Organ 1 · Diagnose 2</small>
                </button>
              </div>
            </section>

            <section className="config-block">
              <span className="config-number">04</span>
              <div>
                <h2>Physiologische Referenzen</h2>
                <p>
                  Normalhistologische Präparate werden standardmäßig nicht
                  abgefragt.
                </p>
              </div>
              <div className="weight-options">
                <button
                  type="button"
                  className={!includeReferences ? "active" : ""}
                  onClick={() => setIncludeReferences(false)}
                >
                  <strong>Ausgeschlossen</strong>
                  <small>Standard für die Prüfung</small>
                </button>
                <button
                  type="button"
                  className={includeReferences ? "active" : ""}
                  onClick={() => setIncludeReferences(true)}
                >
                  <strong>Einbeziehen</strong>
                  <small>
                    {referenceRecordCount}{" "}
                    {referenceRecordCount === 1
                      ? "Referenzpräparat"
                      : "Referenzpräparate"}
                  </small>
                </button>
              </div>
            </section>

            <section className="config-selection">
              <div className="config-selection-head">
                <div>
                  <span className="config-number">05</span>
                  <div>
                    <h2>Prüfungsbereich</h2>
                    <p>
                      Standardmäßig sind alle Organsysteme und Organe
                      eingeschlossen.
                    </p>
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setExcludedOrgans(new Set())}
                  >
                    Alle auswählen
                  </button>
                  <button
                    type="button"
                    onClick={() => setExcludedOrgans(new Set(allOrgans))}
                  >
                    Auswahl aufheben
                  </button>
                </div>
              </div>

              <div className="exam-system-list">
                {systems.map((system) => {
                  const systemSelected = system.organs.every(
                    (organ) => !excludedOrgans.has(organ),
                  );
                  const selectedInSystem = system.organs.filter(
                    (organ) => !excludedOrgans.has(organ),
                  ).length;
                  const systemPreparations = system.organs.reduce(
                    (sum, organ) =>
                      sum + countPreparations(organ, eligibleRecords),
                    0,
                  );
                  return (
                    <details key={system.id}>
                      <summary>
                        <input
                          className="system-selection-checkbox"
                          type="checkbox"
                          checked={systemSelected}
                          aria-label={`${system.name} ${
                            systemSelected ? "abwählen" : "auswählen"
                          }`}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => toggleSystem(system)}
                        />
                        <span className="system-summary-title">
                          {system.name}
                        </span>
                        <small>
                          {selectedInSystem}/{system.organs.length} Organe ·{" "}
                          {preparationCountLabel(systemPreparations)}
                        </small>
                        <i
                          className="system-summary-chevron"
                          aria-hidden="true"
                        >
                          ⌄
                        </i>
                      </summary>
                      <div>
                        {system.organs.map((organ) => (
                          <label key={organ}>
                            <input
                              type="checkbox"
                              checked={!excludedOrgans.has(organ)}
                              onChange={() => toggleOrgan(organ)}
                            />
                            <span>{organ}</span>
                            <small>
                              {preparationCountLabel(
                                countPreparations(organ, eligibleRecords),
                              )}
                            </small>
                          </label>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="exam-config-summary">
            <p className="eyebrow">Zusammenfassung</p>
            <dl>
              <div>
                <dt>Prüfungsart</dt>
                <dd className="summary-mode">
                  {feedbackMode === "exam" ? "Klausur" : "Lernen"}
                </dd>
              </div>
              <div>
                <dt>Prüfungsfälle</dt>
                <dd>{effectiveQuestionCount}</dd>
              </div>
              <div>
                <dt>Ausgewählte Organe</dt>
                <dd>{selectedOrganCount}</dd>
              </div>
              <div>
                <dt>Verfügbare Präparate</dt>
                <dd>{eligibleRecords.length}</dd>
              </div>
              <div>
                <dt>Physiologische Referenzen</dt>
                <dd>{includeReferences ? "Einbezogen" : "Ausgeschlossen"}</dd>
              </div>
              <div>
                <dt>Maximalpunktzahl</dt>
                <dd>
                  {effectiveQuestionCount * (1 + diagnosisWeight)}
                </dd>
              </div>
            </dl>
            <p>
              Pro Fall: 1 Punkt für das Organ und {diagnosisWeight}{" "}
              {diagnosisWeight === 1 ? "Punkt" : "Punkte"} für die Diagnose.
            </p>
            <button
              type="button"
              onClick={startExam}
              disabled={effectiveQuestionCount === 0}
            >
              Prüfung starten
            </button>
          </aside>
        </section>

        <div className="exam-start-dock">
          <span>
            <strong>{effectiveQuestionCount}</strong> Fälle ·{" "}
            {selectedOrganCount} Organe
          </span>
          <button
            type="button"
            onClick={startExam}
            disabled={effectiveQuestionCount === 0}
          >
            Prüfung starten
          </button>
        </div>
      </main>
    );
  }

  if (phase === "results") {
    const earnedPoints = answers.reduce(
      (sum, answer) =>
        sum + answer.organPoint + answer.diagnosisPoints,
      0,
    );
    const maximumPoints = answers.length * (1 + diagnosisWeight);
    const percentage =
      maximumPoints === 0
        ? 0
        : Math.round((earnedPoints / maximumPoints) * 100);

    return (
      <main className="exam-results-page" id="top">
        <section className="exam-results-hero">
          <p className="eyebrow">Prüfung abgeschlossen</p>
          <h1>{percentage}%</h1>
          <p>
            {earnedPoints} von {maximumPoints} Punkten
          </p>
          <div>
            <button type="button" onClick={() => setPhase("configure")}>
              Neue Prüfung konfigurieren
            </button>
            <button type="button" onClick={startExam}>
              Gleiche Auswahl wiederholen
            </button>
          </div>
        </section>

        <section className="exam-results-list">
          <div className="results-heading">
            <span>Fall</span>
            <span>Lösung</span>
            <span>Organ</span>
            <span>Diagnose</span>
            <span>Punkte</span>
          </div>
          {answers.map((answer, index) => (
            <article key={`${answer.record.number}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <strong>{answer.record.organ}</strong>
                <small>{diagnosisForRecord(answer.record)}</small>
              </div>
              <span className={answer.organPoint ? "correct" : "wrong"}>
                {answer.organPoint ? "1 / 1" : "0 / 1"}
              </span>
              <span className={answer.diagnosisPoints ? "correct" : "wrong"}>
                {answer.diagnosisPoints} / {diagnosisWeight}
              </span>
              <strong>
                {answer.organPoint + answer.diagnosisPoints} /{" "}
                {1 + diagnosisWeight}
              </strong>
            </article>
          ))}
        </section>
      </main>
    );
  }

  const currentRecord = examRecords[currentIndex];
  const maximumExamPoints = examRecords.length * (1 + diagnosisWeight);
  const earnedPointsSoFar = answers.reduce(
    (sum, answer) =>
      sum + answer.organPoint + answer.diagnosisPoints,
    0,
  );
  const answeredPoints = answers.length * (1 + diagnosisWeight);
  const lostPointsSoFar = answeredPoints - earnedPointsSoFar;
  const unansweredPoints = maximumExamPoints - answeredPoints;

  return (
    <main className="configured-exam-page" id="top">
      <section className="exam-progress">
        <div>
          <p className="eyebrow">
            {feedbackMode === "exam" ? "Klausurmodus" : "Lernmodus"}
          </p>
          <h1>
            Präparat {currentIndex + 1} von {examRecords.length}
          </h1>
        </div>
        <div>
          {feedbackMode === "learn" ? (
            <div className="learning-score-progress">
              <div
                className="score-progress-bar"
                role="progressbar"
                aria-label="Punktefortschritt"
                aria-valuemin={0}
                aria-valuemax={maximumExamPoints}
                aria-valuenow={answeredPoints}
              >
                <span
                  className="earned"
                  style={{
                    width: `${(earnedPointsSoFar / maximumExamPoints) * 100}%`,
                  }}
                />
                <span
                  className="lost"
                  style={{
                    width: `${(lostPointsSoFar / maximumExamPoints) * 100}%`,
                  }}
                />
                <span
                  className="unanswered"
                  style={{
                    width: `${(unansweredPoints / maximumExamPoints) * 100}%`,
                  }}
                />
              </div>
              <div className="score-progress-legend">
                <span className="earned">
                  {earnedPointsSoFar} richtig
                </span>
                <span className="lost">{lostPointsSoFar} falsch</span>
                <span className="unanswered">
                  {unansweredPoints} offen
                </span>
              </div>
            </div>
          ) : (
            <>
              <span>Maximal {maximumExamPoints} Punkte</span>
              <progress
                max={examRecords.length}
                value={currentIndex + 1}
              />
            </>
          )}
          <button
            type="button"
            className="abort-exam-button"
            onClick={abortExam}
          >
            Prüfung abbrechen
          </button>
        </div>
      </section>

      <section className="configured-exam-workspace">
        <div className="configured-exam-image">
          <ExamSlide record={currentRecord} />
        </div>
        <aside className="configured-answer-panel">
          <p className="eyebrow">Deine Antwort</p>
          <h2>Organ und Diagnose</h2>
          <FilterCombobox
            label="Organ"
            value={organAnswer}
            options={allOrgans}
            onChange={setOrganAnswer}
            disabled={Boolean(currentFeedback)}
          />
          <FilterCombobox
            label="Diagnose"
            value={diagnosisAnswer}
            options={diagnosisOptions}
            onChange={setDiagnosisAnswer}
            disabled={Boolean(currentFeedback)}
          />
          <div className="question-points">
            <span>Organ · 1 Punkt</span>
            <span>
              Diagnose · {diagnosisWeight}{" "}
              {diagnosisWeight === 1 ? "Punkt" : "Punkte"}
            </span>
          </div>
          {currentFeedback ? (
            <div className="learning-feedback">
              <p
                className={
                  currentFeedback.organPoint === 1 &&
                  currentFeedback.diagnosisPoints === diagnosisWeight
                    ? "feedback-correct"
                    : "feedback-partial"
                }
              >
                {currentFeedback.organPoint === 1 &&
                currentFeedback.diagnosisPoints === diagnosisWeight
                  ? "Vollständig richtig"
                  : "Lösung vergleichen"}
              </p>
              <dl>
                <div>
                  <dt>Organ</dt>
                  <dd>
                    <span
                      className={
                        currentFeedback.organPoint ? "correct" : "wrong"
                      }
                    >
                      Deine Antwort: {currentFeedback.organAnswer}
                    </span>
                    <strong>Lösung: {currentRecord.organ}</strong>
                  </dd>
                </div>
                <div>
                  <dt>Diagnose</dt>
                  <dd>
                    <span
                      className={
                        currentFeedback.diagnosisPoints ? "correct" : "wrong"
                      }
                    >
                      Deine Antwort: {currentFeedback.diagnosisAnswer}
                    </span>
                    <strong>
                      Lösung: {diagnosisForRecord(currentRecord)}
                    </strong>
                  </dd>
                </div>
              </dl>
              <button type="button" onClick={advanceToNextCase}>
                {currentIndex + 1 === examRecords.length
                  ? "Prüfung abschließen"
                  : "Nächstes Präparat"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="primary-button"
              disabled={!organAnswer || !diagnosisAnswer}
              onClick={submitExamAnswer}
            >
              {feedbackMode === "learn"
                ? "Antwort prüfen"
                : currentIndex + 1 === examRecords.length
                  ? "Prüfung abschließen"
                  : "Antwort speichern und weiter"}
            </button>
          )}
        </aside>
      </section>
    </main>
  );
}

function PendingOrganChapter({
  organ,
  records,
}: {
  organ: string;
  records: CourseRecord[];
}) {
  const organRecords = records.filter((record) => record.organ === organ);

  return (
    <section className="pending-organ-chapter">
      <p className="eyebrow">Bildatlas in Vorbereitung</p>
      <h2>{organ}</h2>
      <p>
        Die {organRecords.length} Kurspräparate sind bereits in die feste
        Lernhierarchie einsortiert. Übersichtsbilder und Detailausschnitte
        werden mit dem festgelegten Atlas-Workflow ergänzt.
      </p>
    </section>
  );
}

export default function Home() {
  const [mode, setMode] = useState<AppMode>("atlas");
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  const [activePreparationNumber, setActivePreparationNumber] =
    useState<string | null>(null);
  const [pendingPreparationNumber, setPendingPreparationNumber] =
    useState<string | null>(null);
  const [courseRecords, setCourseRecords] = useState<CourseRecord[]>([
    {
      number: "001",
      organ: "Kolon",
      diagnosis: "Referenz",
      overview: "./atlas/001-kolon/uebersicht-hochaufloesend.jpg",
      atlas_overview: "./atlas/001-kolon/uebersicht-atlas-annotiert.jpg",
    },
  ]);
  const organSystems = useMemo(
    () => getAvailableOrganSystems(courseRecords),
    [courseRecords],
  );
  const activePreparation = useMemo(
    () =>
      courseRecords.find(
        (record) => record.number === activePreparationNumber,
      ) ?? null,
    [activePreparationNumber, courseRecords],
  );

  function openPreparation(record: CourseRecord) {
    setMode("atlas");
    setPendingPreparationNumber(record.number);
    setSelectedOrgan(record.organ);
  }

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(() => {
        // The app remains fully usable online if service-worker registration is
        // unavailable in a particular local browser.
      });
    }

    fetch("./atlas/index.json")
      .then((response) => response.json())
      .then((data: AtlasIndex) =>
        setCourseRecords(data.preparations.map(normalizeRecordAssets)),
      )
      .catch(() => {
        // Das eingebettete Referenzpräparat hält die App auch bei einem
        // vorübergehend nicht erreichbaren lokalen Index benutzbar.
      });
  }, []);

  useEffect(() => {
    if (
      !pendingPreparationNumber ||
      mode !== "atlas" ||
      !selectedOrgan
    ) {
      return;
    }

    const targetId = `praeparat-${pendingPreparationNumber}`;
    let observer: MutationObserver | null = null;
    let timeoutId: number | null = null;

    const navigateWhenReady = () => {
      const target = document.getElementById(targetId);
      if (!target) return false;

      observer?.disconnect();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      window.history.replaceState(null, "", `#${targetId}`);
      setActivePreparationNumber(pendingPreparationNumber);
      setPendingPreparationNumber(null);
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      });
      return true;
    };

    if (!navigateWhenReady()) {
      observer = new MutationObserver(navigateWhenReady);
      observer.observe(
        document.querySelector(".app") ?? document.body,
        { childList: true, subtree: true },
      );
      timeoutId = window.setTimeout(() => {
        observer?.disconnect();
        navigateWhenReady();
      }, 4000);
    }

    return () => {
      observer?.disconnect();
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [mode, pendingPreparationNumber, selectedOrgan]);

  useEffect(() => {
    if (mode !== "atlas" || !selectedOrgan) {
      setActivePreparationNumber(null);
      return;
    }

    let animationFrame: number | null = null;
    const updateActivePreparation = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      animationFrame = window.requestAnimationFrame(() => {
        const headerBottom =
          document
            .querySelector<HTMLElement>(".app-header")
            ?.getBoundingClientRect().bottom ?? 78;
        const marker = headerBottom + 80;
        const sections = Array.from(
          document.querySelectorAll<HTMLElement>(".preparation-chapter"),
        );
        let currentNumber: string | null = null;

        for (const section of sections) {
          if (section.getBoundingClientRect().top > marker) break;
          currentNumber = section.id.replace("praeparat-", "");
        }
        setActivePreparationNumber(currentNumber);
      });
    };

    updateActivePreparation();
    window.addEventListener("scroll", updateActivePreparation, {
      passive: true,
    });
    window.addEventListener("resize", updateActivePreparation);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
      window.removeEventListener("scroll", updateActivePreparation);
      window.removeEventListener("resize", updateActivePreparation);
    };
  }, [courseRecords, mode, selectedOrgan]);

  return (
    <div className="app">
      <Header
        mode={mode}
        setMode={setMode}
        organSystems={organSystems}
        records={courseRecords}
        selectedOrgan={selectedOrgan}
        activePreparation={activePreparation}
        selectOrgan={setSelectedOrgan}
        selectPreparation={openPreparation}
        showOverview={() => setSelectedOrgan(null)}
      />
      {mode === "atlas" ? (
        selectedOrgan === null ? (
          <SystemOverview
            systems={organSystems}
            records={courseRecords}
            selectOrgan={setSelectedOrgan}
          />
        ) : (
          <main key={selectedOrgan}>
            <OrganIntro organ={selectedOrgan} records={courseRecords} />
            <OrganAtlas organ={selectedOrgan} records={courseRecords} />
          </main>
        )
      ) : (
        <TrainingMode records={courseRecords} />
      )}
      <footer className="app-footer">
        <div>
          <strong>Histopathologie-Atlas</strong>
          <span>Lokaler Atlas · organspezifische Kapitel</span>
        </div>
        <p>
          Unabhängiges Lehrprojekt auf Grundlage des Virtuellen
          Mikroskopierkurses Pathologie Erlangen. Kein offizielles Angebot des
          Universitätsklinikums Erlangen.
        </p>
      </footer>
    </div>
  );
}
