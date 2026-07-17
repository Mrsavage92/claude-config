import {
  CertificationSchema,
  DomainSchema,
  FlashFireSchema,
  isOfficialProvenance,
  LabSchema,
  LessonSchema,
  ProvenanceSchema,
  QuestionSchema,
  SourceSchema,
  TaskStatementSchema,
  type Certification,
  type Domain,
  type FlashFire,
  type Lab,
  type Lesson,
  type Question,
  type Source,
  type TaskStatement,
} from '@/schemas';

export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  entity: string;
  message: string;
}

export interface ContentBundle {
  certifications: Certification[];
  domains: Domain[];
  taskStatements: TaskStatement[];
  lessons: Lesson[];
  questions: Question[];
  flashFire: FlashFire[];
  labs: Lab[];
  sources: Source[];
}

/**
 * Validate the entire content graph. Returns every issue found; the content
 * test suite asserts there are zero errors. This runs in development on load
 * as well, so broken content fails loudly rather than reaching a learner.
 */
export function validateContent(bundle: ContentBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const err = (code: string, entity: string, message: string) =>
    issues.push({ severity: 'error', code, entity, message });
  const warn = (code: string, entity: string, message: string) =>
    issues.push({ severity: 'warning', code, entity, message });

  const domainIds = new Set(bundle.domains.map((d) => d.id));
  const taskIds = new Set(bundle.taskStatements.map((t) => t.id));
  const lessonIds = new Set(bundle.lessons.map((l) => l.id));
  const labIds = new Set(bundle.labs.map((l) => l.id));
  const questionIds = new Set(bundle.questions.map((q) => q.id));
  const sourceIds = new Set(bundle.sources.map((s) => s.id));
  const certIds = new Set(bundle.certifications.map((c) => c.id));

  // ---- Schema validation (shape) --------------------------------------
  const schemaChecks: [string, { safeParse: (x: unknown) => { success: boolean; error?: unknown } }, unknown[]][] = [
    ['certification', CertificationSchema, bundle.certifications],
    ['domain', DomainSchema, bundle.domains],
    ['task-statement', TaskStatementSchema, bundle.taskStatements],
    ['lesson', LessonSchema, bundle.lessons],
    ['question', QuestionSchema, bundle.questions],
    ['flash-fire', FlashFireSchema, bundle.flashFire],
    ['lab', LabSchema, bundle.labs],
    ['source', SourceSchema, bundle.sources],
  ];
  for (const [kind, schema, items] of schemaChecks) {
    items.forEach((item, i) => {
      const res = schema.safeParse(item);
      if (!res.success) {
        const id = (item as { id?: string })?.id ?? `#${i}`;
        err('schema', `${kind}:${id}`, `Failed schema validation: ${JSON.stringify(res.error)}`);
      }
    });
  }

  // ---- Duplicate ids ---------------------------------------------------
  const dupCheck = (kind: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) err('duplicate-id', `${kind}:${id}`, `Duplicate ${kind} id "${id}".`);
      seen.add(id);
    }
  };
  dupCheck('certification', bundle.certifications.map((c) => c.id));
  dupCheck('domain', bundle.domains.map((d) => d.id));
  dupCheck('task-statement', bundle.taskStatements.map((t) => t.id));
  dupCheck('lesson', bundle.lessons.map((l) => l.id));
  dupCheck('question', bundle.questions.map((q) => q.id));
  dupCheck('flash-fire', bundle.flashFire.map((f) => f.id));
  dupCheck('lab', bundle.labs.map((l) => l.id));
  dupCheck('source', bundle.sources.map((s) => s.id));

  // Cross-kind id collision would break lookups sharing a namespace in the UI.
  const allContentIds = [
    ...bundle.lessons.map((l) => l.id),
    ...bundle.questions.map((q) => q.id),
    ...bundle.flashFire.map((f) => f.id),
    ...bundle.labs.map((l) => l.id),
  ];
  dupCheck('content', allContentIds);

  // ---- Domains ---------------------------------------------------------
  for (const cert of bundle.certifications) {
    const certDomains = bundle.domains.filter((d) => d.certificationId === cert.id);
    const weightSum = certDomains.reduce((s, d) => s + d.weighting, 0);
    if (Math.abs(weightSum - 1) > 0.001) {
      err('weighting-sum', `certification:${cert.id}`, `Domain weightings sum to ${weightSum.toFixed(3)}, expected 1.0.`);
    }
    for (const sid of cert.sourceIds) {
      if (!sourceIds.has(sid)) err('missing-source', `certification:${cert.id}`, `References missing source "${sid}".`);
    }
  }

  for (const d of bundle.domains) {
    if (!certIds.has(d.certificationId)) err('missing-cert', `domain:${d.id}`, `References missing certification "${d.certificationId}".`);
    if (d.weighting < 0 || d.weighting > 1) err('invalid-weighting', `domain:${d.id}`, `Weighting ${d.weighting} is out of range.`);
    for (const tid of d.taskStatementIds) {
      if (!taskIds.has(tid)) err('missing-task', `domain:${d.id}`, `References missing task statement "${tid}".`);
    }
    for (const lid of d.lessonIds) {
      if (!lessonIds.has(lid)) err('missing-lesson', `domain:${d.id}`, `References missing lesson "${lid}".`);
    }
    for (const sid of d.sourceIds) {
      if (!sourceIds.has(sid)) err('missing-source', `domain:${d.id}`, `References missing source "${sid}".`);
    }
  }

  for (const t of bundle.taskStatements) {
    if (!domainIds.has(t.domainId)) err('missing-domain', `task-statement:${t.id}`, `References missing domain "${t.domainId}".`);
  }

  // ---- Lessons ---------------------------------------------------------
  for (const l of bundle.lessons) {
    if (!domainIds.has(l.domainId)) err('missing-domain', `lesson:${l.id}`, `References missing domain "${l.domainId}".`);
    if (l.taskStatementId && !taskIds.has(l.taskStatementId)) {
      err('missing-task', `lesson:${l.id}`, `References missing task statement "${l.taskStatementId}".`);
    }
    l.relatedQuestionIds.forEach((qid) => {
      if (!questionIds.has(qid)) err('broken-ref', `lesson:${l.id}`, `Related question "${qid}" does not exist.`);
    });
    l.relatedLabIds.forEach((lid) => {
      if (!labIds.has(lid)) err('broken-ref', `lesson:${l.id}`, `Related lab "${lid}" does not exist.`);
    });
    l.sourceIds.forEach((sid) => {
      if (!sourceIds.has(sid)) err('missing-source', `lesson:${l.id}`, `References missing source "${sid}".`);
    });
  }

  // ---- Questions -------------------------------------------------------
  for (const q of bundle.questions) {
    if (!domainIds.has(q.domainId)) err('missing-domain', `question:${q.id}`, `References missing domain "${q.domainId}".`);
    if (q.taskStatementId && !taskIds.has(q.taskStatementId)) {
      err('missing-task', `question:${q.id}`, `References missing task statement "${q.taskStatementId}".`);
    }

    const optionIds = q.answerOptions.map((o) => o.id);
    const optionSet = new Set(optionIds);
    if (optionSet.size !== optionIds.length) {
      err('duplicate-option', `question:${q.id}`, 'Duplicate option id within the question.');
    }
    if (q.correctAnswerIds.length === 0) {
      err('no-correct-answer', `question:${q.id}`, 'Has no correct answer.');
    }
    for (const cid of q.correctAnswerIds) {
      if (!optionSet.has(cid)) err('correct-not-an-option', `question:${q.id}`, `Correct id "${cid}" is not one of the options.`);
    }
    if (q.questionType === 'single-choice' && q.correctAnswerIds.length !== 1) {
      err('single-choice-count', `question:${q.id}`, `Single-choice must have exactly 1 correct answer, has ${q.correctAnswerIds.length}.`);
    }
    if (q.questionType === 'multiple-response' && q.correctAnswerIds.length < 2) {
      err('multiple-response-count', `question:${q.id}`, `Multiple-response must have at least 2 correct answers, has ${q.correctAnswerIds.length}.`);
    }
    // Every option must have an explanation.
    for (const oid of optionIds) {
      if (!q.explanationForEachOption[oid] || q.explanationForEachOption[oid].trim() === '') {
        err('missing-option-explanation', `question:${q.id}`, `Option "${oid}" has no explanation.`);
      }
    }
    if (!ProvenanceSchema.safeParse(q.provenance).success) {
      err('bad-provenance', `question:${q.id}`, `Unsupported provenance "${q.provenance}".`);
    }
    q.relatedLessonIds.forEach((lid) => {
      if (!lessonIds.has(lid)) err('broken-ref', `question:${q.id}`, `Related lesson "${lid}" does not exist.`);
    });
    q.relatedLabIds.forEach((lid) => {
      if (!labIds.has(lid)) err('broken-ref', `question:${q.id}`, `Related lab "${lid}" does not exist.`);
    });
    if (q.sourceIds.length === 0) warn('no-source', `question:${q.id}`, 'Question has no source.');
    q.sourceIds.forEach((sid) => {
      if (!sourceIds.has(sid)) err('missing-source', `question:${q.id}`, `References missing source "${sid}".`);
    });
  }

  // ---- Flash Fire ------------------------------------------------------
  for (const f of bundle.flashFire) {
    if (!domainIds.has(f.domainId)) err('missing-domain', `flash-fire:${f.id}`, `References missing domain "${f.domainId}".`);
    const optionSet = new Set(f.answerOptions.map((o) => o.id));
    if (optionSet.size !== f.answerOptions.length) err('duplicate-option', `flash-fire:${f.id}`, 'Duplicate option id.');
    if (f.correctAnswerIds.length === 0) err('no-correct-answer', `flash-fire:${f.id}`, 'Flash Fire item has no correct answer.');
    for (const cid of f.correctAnswerIds) {
      if (!optionSet.has(cid)) err('correct-not-an-option', `flash-fire:${f.id}`, `Correct id "${cid}" is not one of the options.`);
    }
    f.relatedQuestionIds.forEach((qid) => {
      if (!questionIds.has(qid)) err('broken-ref', `flash-fire:${f.id}`, `Related question "${qid}" does not exist.`);
    });
    f.relatedLessonIds.forEach((lid) => {
      if (!lessonIds.has(lid)) err('broken-ref', `flash-fire:${f.id}`, `Related lesson "${lid}" does not exist.`);
    });
    f.sourceIds.forEach((sid) => {
      if (!sourceIds.has(sid)) err('missing-source', `flash-fire:${f.id}`, `References missing source "${sid}".`);
    });
  }

  // ---- Labs ------------------------------------------------------------
  for (const lab of bundle.labs) {
    lab.domainIds.forEach((did) => {
      if (!domainIds.has(did)) err('missing-domain', `lab:${lab.id}`, `References missing domain "${did}".`);
    });
    lab.relatedQuestionIds.forEach((qid) => {
      if (!questionIds.has(qid)) err('broken-ref', `lab:${lab.id}`, `Related question "${qid}" does not exist.`);
    });
    lab.sourceIds.forEach((sid) => {
      if (!sourceIds.has(sid)) err('missing-source', `lab:${lab.id}`, `References missing source "${sid}".`);
    });
  }

  // ---- Provenance surfacing rule --------------------------------------
  // (Sanity: any question flagged official must actually be an official kind.)
  for (const q of bundle.questions) {
    if (q.provenance === 'unclear' && q.enabled) {
      warn('unclear-enabled', `question:${q.id}`, 'Enabled question has unclear provenance; ensure it is never labelled official.');
    }
    // No enabled question may claim officialness it does not have — checked by
    // the UI badge which reads provenance directly; here we assert consistency.
    if (isOfficialProvenance(q.provenance) && q.sourceIds.length === 0) {
      err('official-without-source', `question:${q.id}`, 'Official-provenance question must cite a source.');
    }
  }

  return issues;
}

export function errorsOnly(issues: ValidationIssue[]): ValidationIssue[] {
  return issues.filter((i) => i.severity === 'error');
}
