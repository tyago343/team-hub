export abstract class OpaqueTokenHasher {
  abstract hash(rawToken: string): string;
}
