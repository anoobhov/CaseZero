import { caseSchema } from "./caseSchema";

export function validateCase(data: unknown) {
  const result = caseSchema.safeParse(data);

  if (!result.success) {
    throw new Error(
      `Invalid case structure:\n${result.error.message}`
    );
  }

  const caseData = result.data;

  // -------------------------
  // Collect IDs
  // -------------------------

  const suspectIds = new Set(
    caseData.suspects.map((s) => s.id)
  );

  const locationIds = new Set(
    caseData.locations.map((l) => l.id)
  );

  const evidenceIds = new Set(
    caseData.evidence.map((e) => e.id)
  );

  const timelineIds = new Set(
    caseData.timeline.map((t) => t.id)
  );

  // -------------------------
  // Check duplicate IDs
  // -------------------------

  if (suspectIds.size !== caseData.suspects.length) {
    throw new Error("Duplicate suspect ID found");
  }

  if (locationIds.size !== caseData.locations.length) {
    throw new Error("Duplicate location ID found");
  }

  if (evidenceIds.size !== caseData.evidence.length) {
    throw new Error("Duplicate evidence ID found");
  }

  if (timelineIds.size !== caseData.timeline.length) {
    throw new Error("Duplicate timeline ID found");
  }

  // -------------------------
  // Check culprit
  // -------------------------

  if (!suspectIds.has(caseData.solution.culpritId)) {
    throw new Error(
      `Culprit ID does not exist: ${caseData.solution.culpritId}`
    );
  }

  // -------------------------
  // Check evidence references
  // -------------------------

  for (const evidence of caseData.evidence) {
    if (!locationIds.has(evidence.locationId)) {
      throw new Error(
        `Evidence ${evidence.id} references invalid location ${evidence.locationId}`
      );
    }

    for (const suspectId of evidence.hiddenTruth.relatedSuspects) {
      if (!suspectIds.has(suspectId)) {
        throw new Error(
          `Evidence ${evidence.id} references invalid suspect ${suspectId}`
        );
      }
    }

    // for (const evidenceId of evidence.hiddenTruth.contradicts) {
    //   if (!evidenceIds.has(evidenceId)) {
    //     throw new Error(
    //       `Evidence ${evidence.id} references invalid evidence ${evidenceId}`
    //     );
    //   }
    // }

//     for (const suspectId of evidence.hiddenTruth.contradicts) {
//   if (!suspectIds.has(suspectId)) {
//     throw new Error(
//       `Evidence ${evidence.id} contradicts invalid suspect ${suspectId}`
//     );
//   }
// }
  }

  // -------------------------
  // Check timeline
  // -------------------------

  for (const event of caseData.timeline) {
    if (
      event.actorId !== "victim" &&
      !suspectIds.has(event.actorId)
    ) {
      throw new Error(
        `Timeline ${event.id} references invalid actor ${event.actorId}`
      );
    }

    if (!locationIds.has(event.locationId)) {
      throw new Error(
        `Timeline ${event.id} references invalid location ${event.locationId}`
      );
    }
  }

  // -------------------------
  // Check relationships
  // -------------------------

  for (const relationship of caseData.relationships) {
    const validFrom =
      relationship.from === "victim" ||
      suspectIds.has(relationship.from);

    const validTo =
      relationship.to === "victim" ||
      suspectIds.has(relationship.to);

    if (!validFrom || !validTo) {
      throw new Error(
        `Invalid relationship: ${relationship.from} -> ${relationship.to}`
      );
    }
  }

  // -------------------------
  // Check required evidence
  // -------------------------

  for (const evidenceId of caseData.solution.requiredEvidence) {
    if (!evidenceIds.has(evidenceId)) {
      throw new Error(
        `Solution references invalid evidence ${evidenceId}`
      );
    }
  }

  // -------------------------
  // Everything passed
  // -------------------------

  return caseData;
}