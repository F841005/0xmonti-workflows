export interface Env {
  MONTI_HARDWARE_ID: string;
  MONTI_CONTAINER_PROFILE: string;
  MONTI_AUTHORITY: string;
  MONTI_OPERATOR: string;
  MONTI_POLICY: string;
  MONTI_KECCAK256_PROOF: string;
  MONTI_CALLDATA_SEAL: string;
  PledgeOfAlligienceTO: string;
  GIST_INTEGRATION_URL: string;
  MONTI_OAT_TOKEN: string;
  MONTI_CHAIN_ID: string;
  TREASURY_VAULT: string;
  EVM_BASE_SIGNER: string;
  SOLANA_PLEDGED_WALLET: string;
  TON_RECIPIENT_ADDRESS: string;
  COMMITTEE_DOMAIN: string;
  STATUTORY_COMPLIANCE: string;
  SHARED_ENCLAVE_MEMORY?: SharedArrayBuffer;
}
