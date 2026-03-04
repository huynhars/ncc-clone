// services/auth.service.ts
import { axiosPublic, axiosAuth } from "@/src/lib/api";

export const login = (data: {
  userNameOrEmailAddress: string;
  password: string;
  rememberClient: boolean;
}) => {
  return axiosPublic.post(
    "/api/TokenAuth/Authenticate",
    data
  );
};

export const getCurrentLoginInformations = () => {
  return axiosAuth.get(
    "/api/services/app/Session/GetCurrentLoginInformations"
  );
};
