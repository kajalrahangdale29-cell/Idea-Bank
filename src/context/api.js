const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const LOGIN_URL = BASE_URL + "/login";

export const DASHBOARD_URL = BASE_URL + "/dashboard";

export const IDEA_DETAIL_URL = BASE_URL + "/detail";

export const CREATE_IDEA_POST_URL = BASE_URL + "/create";
//export const MY_IDEAS_URL = BASE_URL + "/MyIdealist?page=1&pageSize=10";
export const MY_IDEAS_URL = BASE_URL + "/MyIdealist";
export const EDIT_IDEA_URL = (id) => `${BASE_URL}/edit/${id}`; 
export const MANAGER_EDIT_IDEA_URL = (id) => `${BASE_URL}/api/Approval/edit/${id}`;
export const EDIT_IMPLEMENTATION_URL = (id) => `${BASE_URL}/api/Approval/implementation/edit/${id}`;
export const PUBLISH_IDEA_URL = (id) => `${BASE_URL}/edit/${id}?SubmitType=publish`; 
export const DELETE_IDEA_URL = (id) => `${BASE_URL}/delete/${id}`;
export const SUBMIT_URL = BASE_URL + "/submit"; 
export const ALL_TEAM_IDEAS_URL = `${BASE_URL}/api/Approval/allIdeas?page=1&pageSize=10`;
export const TEAM_IDEAS_URL = `${BASE_URL}/api/Approval/teamIdeas?page=1`;
export const APPROVED_BY_ME_URL = BASE_URL + "/api/Approval/approved-by-me?sortOrder=desc&page=1&pageSize=10";
export const HOLD_BY_ME_URL = BASE_URL + "/api/Approval/hold-by-me?sortOrder=desc&page=1&pageSize=10";
export const PENDING_APPROVALS_URL = BASE_URL + "/api/Approval/pending-approvals?sortOrder=desc&page=1&pageSize=10";
export const REJECTED_BY_ME_URL = BASE_URL + "/api/Approval/rejected-by-me?sortOrder=desc&page=1&pageSize=10";
export const UPDATE_STATUS_URL = BASE_URL + "/api/Approval/UpdateStatus";
export const GET_PENDING_COUNT_URL = BASE_URL + "/api/Approval/GetPendingApprovalsCount";

export const EMPLOYEE_GET_URL = BASE_URL + "/EmployeeInfo";
export const NOTIFICATION_USER_URL = (userId, scope) => {
  let url = `${BASE_URL}/user/${userId}`;
  if (scope && scope !== 'self') {
    url += `?scope=${scope}`;
  }
  return url;
};
export const NOTIFICATION_COUNT_URL = (userId, scope) => { 
  let url = `${BASE_URL}/unread/count/${userId}`;
  if (scope && scope !== 'self') {
    url += `?scope=${scope}`;
  }
  return url; 
}; 
export const MARK_READ_URL = (notificationId) => `${BASE_URL}/markread/${notificationId}`; 
export const CLEAR_ALL_URL = (userId) => `${BASE_URL}/clearall/${userId}`; 
export const REDIRECT_NOTIFICATION_URL = (notificationId) => `${BASE_URL}/redirect/${notificationId}`; 
