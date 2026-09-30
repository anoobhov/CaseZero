export async function getSession(sessionId: string) {
  const response = await fetch(`/api/sessions/${sessionId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch session");
  }

  return data;
}

export async function investigateLocation(
  sessionId: string,
  locationId: string
) {
  const response = await fetch(
    `/api/sessions/${sessionId}/investigate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to investigate location");
  }

  return data;
}

export async function discoverEvidence(
  sessionId: string,
  evidenceId: string
) {
  const response = await fetch(
    `/api/sessions/${sessionId}/evidence/${evidenceId}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to discover evidence");
  }

  return data;
}

export async function interrogateSuspect(
  sessionId: string,
  suspectId: string
) {
  const response = await fetch(
    `/api/sessions/${sessionId}/interrogate/${suspectId}`,
    {
      method: "POST",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to interrogate suspect");
  }

  return data;
}

export async function submitAccusation(
  sessionId: string,
  accusation: {
    suspectId: string;
    motive: string;
    method: string;
    reasoning: string;
  }
) {
  const response = await fetch(
    `/api/sessions/${sessionId}/accuse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accusation),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit accusation");
  }

  return data;
}