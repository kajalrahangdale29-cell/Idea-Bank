const BASE_URL = "https://ideabank-api-dev.abisaio.com";

export const LOGIN_URL = BASE_URL + "/api/Auth/login";
export const CREATE_IDEA_POST_URL = BASE_URL + "/create";
export const EMPLOYEE_GET_URL = BASE_URL + "/EmployeeInfo";
export const DASHBOARD_URL = BASE_URL + "/dashboard";
export const MY_IDEAS_URL = BASE_URL + "/MyIdealist?page=1&pageSize=10";
export const IDEA_DETAIL_URL = BASE_URL + "/detail";
export const APPROVED_BY_ME_URL = BASE_URL + "/approved-by-me?sortOrder=desc&page=1&pageSize=10";
export const HOLD_BY_ME_URL = BASE_URL + "/hold-by-me?sortOrder=desc&page=1&pageSize=10";
export const PENDING_APPROVALS_URL = BASE_URL + "/pending-approvals?sortOrder=desc&page=1&pageSize=10";
export const REJECTED_BY_ME_URL = BASE_URL + "/rejected-by-me?sortOrder=desc&page=1&pageSize=10";
export const EDIT_IDEA_URL = (id) => `${BASE_URL}/edit/${id}`;
export const PUBLISH_IDEA_URL = (id) => `${BASE_URL}/edit/${id}?SubmitType=publish`;
export const ALL_TEAM_IDEAS_URL = `${BASE_URL}/allIdeas?page=1&pageSize=10`;