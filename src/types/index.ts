import type { Dispatch, PropsWithChildren, SetStateAction } from "react";

export type AuthProps = PropsWithChildren;

export type AuthToken = {
  access_token: string | undefined;
  refresh_token: string | undefined;
};

export type AuthContextType = {
  token: AuthToken | undefined;
  login: (
    username: string,
    password: string,
    setError: Dispatch<SetStateAction<string>>
  ) => void;
  logout: () => void;
};

export type JwtPayload = {
  sub: string;
  username: string;
  fullname: string;
  role: string;
  exp: number;
};

export type TokenResponse = {
  type: string;
  access_token: string;
  refresh_token: string;
};
