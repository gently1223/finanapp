export interface Todo {
  id: number;
  content: string;
}

export interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export interface Meta {
  totalCount: number;
}

export interface Bank {
  id: string;
  logo: string;
  name: string;
  bic: string;
}
export interface User {
  uid: string;
}

export interface Contact {
  address: string;
  capacidad_de_ahorro_mensual: string;
  city: string;
  cuenta_corriente__iban_: string;
  date_of_birth: string;
  days_to_close: string;
  dni_nie: string;
  email: string;
  firstname: string;
  jobtitle: string;
  phone: string;
  lastname: string;
  state: string;
  zip: string;
  plazo_objetivo_financiero_principal: string;
  hubspot_owner_id: string;
  hubspot_owner_name: string;
  objetivo_1: string;
  hubspot_owner_email: string;
  hubspot_owner_avatar: string;
  referidos: string;
  [key: string]: string | boolean;
  client: boolean;
  fb_id: string;
}

export interface FormOnboarding {
  objetivo_1?: string;
  plazo_objetivo_financiero_principal?: string;
  capacidad_de_ahorro_mensual?: number;
}

export interface FormContact {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone: string;
  dni_nie: string;
  fecha_de_nacimiento: string;
  address: string;
  zip: string;
  city: string;
  state: string;
}

export interface HubFormField {
  defaultValue: string;
  label: string;
  name: string;
  options: {
    label: string;
    value: string;
    readOnly: boolean;
    hidden: boolean;
  }[];
  metaData: { name: string; value: string }[];
  fieldType: string;
  required: boolean;
  hidden: boolean;
}

export interface MeetingResponse {
  metadata: Meeting;
}

export interface Meeting {
  title: string;
  endTime: number;
  startTime: number;
  body: string;
  sourceId: string;
  externalUrl: string;
}

export interface UserProduct {
  product_id?: string;
  apex: number;
  apexs?: { amount: number; date: string }[];
  partner: string;
  date: string;
  name: string;
  monthly?: number;
  reason?: string;
  id?: string;
  transactions?: { date: string; amount: number }[];
}

export interface Product {
  bad: string[];
  good: string[];
  name: string;
  description?: string;
  types: string[];
  ranges: string[];
  active?: boolean;
  id: string;
  video?: string;
  persistant: boolean;
  private?: PrivateProduct;
  average_profit: number;
  fixed_profit?: number;
  compound?: boolean;
  //Yearly cost in percentage
  annual_cost?: number;
  //Fixed cost involves a high interest to apply to the amount invested till max, then apply a low interest to the rest ONLY the first year
  // first_cost: {
  //   max: number;
  //   high_interest: number;
  //   low_interest: number;
  // };
  // fixed_cost: number;
  monthly?: boolean;
  max_apex?: number;
  min_apex?: number;
}

export interface PrivateProduct {
  partner: string;
  name: string;
  //No needed here
  // average_profit: number;
  // annual_profit?: number;
  // fixed_profit?: number;
  //TODO details for simulating profits like fixed_profit: null | 12%, annual_profit, average_profit,...
}

export interface Partner {
  name: string;
  id: string;
}

export interface Objective {
  name: string;
  id: string;
  main_product: string;
}
