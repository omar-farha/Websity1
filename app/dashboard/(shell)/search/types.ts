export type SearchClient = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
};

export type SearchProject = {
  id: string;
  name: string;
  client: { id: string; name: string } | null;
};

export type SearchTask = {
  id: string;
  title: string;
  client_id: string | null;
  client_project_id: string | null;
  client: { id: string; name: string } | null;
  client_project: { id: string; name: string } | null;
};
