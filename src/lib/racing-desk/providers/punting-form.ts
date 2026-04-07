export interface PuntingFormMeetingSummary {
  id?: string | number;
  meetingid?: string | number;
  meetingname?: string;
  track?: string;
  venue?: string;
}

export class PuntingFormClient {
  private readonly baseUrl =
    process.env.PUNTING_FORM_BASE_URL ?? "https://api.puntingform.com.au/v2";

  private readonly authHeader =
    process.env.PUNTING_FORM_AUTH_HEADER ?? "Authorization";

  private readonly authToken = process.env.PUNTING_FORM_AUTH_TOKEN;
  private readonly authScheme = process.env.PUNTING_FORM_AUTH_SCHEME ?? "Bearer";

  isConfigured(): boolean {
    return Boolean(this.authToken);
  }

  async getMeetingsList(date: string): Promise<unknown> {
    return this.request(`/form/meetingslist?date=${encodeURIComponent(date)}`);
  }

  async getMeeting(meetingId: string): Promise<unknown> {
    return this.request(`/form/meeting?meetingid=${encodeURIComponent(meetingId)}`);
  }

  async getFields(meetingId: string, raceNumber: number): Promise<unknown> {
    return this.request(
      `/form/fields?meetingid=${encodeURIComponent(meetingId)}&raceno=${raceNumber}`
    );
  }

  async getForm(meetingId: string, raceNumber?: number): Promise<unknown> {
    const raceParam = raceNumber ? `&raceno=${raceNumber}` : "";
    return this.request(
      `/form/form?meetingid=${encodeURIComponent(meetingId)}${raceParam}`
    );
  }

  async getMeetingRatings(meetingId: string): Promise<unknown> {
    return this.request(
      `/Ratings/MeetingRatings?meetingid=${encodeURIComponent(meetingId)}`
    );
  }

  async getMeetingBenchmarks(meetingId: string): Promise<unknown> {
    return this.request(
      `/Ratings/MeetingBenchmarks?meetingid=${encodeURIComponent(meetingId)}`
    );
  }

  private async request(path: string): Promise<unknown> {
    if (!this.authToken) {
      throw new Error("Punting Form credentials are not configured.");
    }

    const headerValue = this.authScheme
      ? `${this.authScheme} ${this.authToken}`
      : this.authToken;

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Accept: "application/json",
        [this.authHeader]: headerValue,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Punting Form request failed with status ${response.status}.`);
    }

    return response.json();
  }
}
