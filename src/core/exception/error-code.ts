export const ErrorCode = {
  /** 성공 */
  SUCCESS: 0,

  /** 글로벌 오류 코드 */
  /** 리소스 없음 */
  NULL_OBJECT: -1,
  /** Request 값 유효성 오류 */
  NOT_VALIDITY: -2,
  /** 필수 Request Parameter 값이 없음 */
  NOT_REQUIRED: -3,
  /** 사용자 인증 오류 */
  USER_NOT_AUTHENTICATION: -4,
  /** 중복 오류 */
  DUPLICATION: -5,
  /** 수정 불가 오류 */
  NOT_UPDATE: -6,
  /** 사용자 없음 */
  USER_NOT_FOUND: -7,

  /** JWT 인증 관련 오류 코드 */
  /** 인증 실패 */
  UNAUTHORIZED: -10,
  /** 토큰 만료 */
  TOKEN_EXPIRED: -11,
  /** 유효하지 않은 토큰 */
  INVALID_TOKEN: -12,

  /** 알 수 없는 오류 */
  ERROR: -99,
} as const;
export type TErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
