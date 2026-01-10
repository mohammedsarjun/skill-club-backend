// utils/agora.ts
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { AGORA_TOKEN_EXPIRE } from '../config/agora.config';

export const generateAgoraToken = ({
  channelName,
  account,
  expireSeconds = AGORA_TOKEN_EXPIRE 
}: {
  channelName: string;
  account: string;
  expireSeconds?: number;
}) => {
  const appID = process.env.AGORA_APP_ID!;
  const appCertificate = process.env.AGORA_APP_CERT!;

  const privilegeExpire = Math.floor(Date.now() / 1000) + expireSeconds;

  return RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    channelName,
    account,
    RtcRole.PUBLISHER,
    privilegeExpire
  );
};
