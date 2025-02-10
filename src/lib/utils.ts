export const isAdmin = (role: string) => {
    return ['legal_admin', 'faculty_admin', 'senate_admin', 'ugc_admin'].includes(role);
  };