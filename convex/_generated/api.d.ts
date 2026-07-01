/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as addresses from "../addresses.js";
import type * as adminUsers from "../adminUsers.js";
import type * as auth from "../auth.js";
import type * as cart from "../cart.js";
import type * as checkout from "../checkout.js";
import type * as counterUtils from "../counterUtils.js";
import type * as coupons from "../coupons.js";
import type * as crons from "../crons.js";
import type * as editorial from "../editorial.js";
import type * as emails_adminEmail from "../emails/adminEmail.js";
import type * as emails_brevoClient from "../emails/brevoClient.js";
import type * as emails_emailLayout from "../emails/emailLayout.js";
import type * as emails_enquiryEmail from "../emails/enquiryEmail.js";
import type * as emails_followUpEmail from "../emails/followUpEmail.js";
import type * as emails_orderEmail from "../emails/orderEmail.js";
import type * as emails_queue from "../emails/queue.js";
import type * as emails_reminderEmail from "../emails/reminderEmail.js";
import type * as emails_restockEmail from "../emails/restockEmail.js";
import type * as emails_reviewEmail from "../emails/reviewEmail.js";
import type * as emails_thankYouEmail from "../emails/thankYouEmail.js";
import type * as enquiries from "../enquiries.js";
import type * as env from "../env.js";
import type * as heroBanners from "../heroBanners.js";
import type * as http from "../http.js";
import type * as occasions from "../occasions.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as recentSearches from "../recentSearches.js";
import type * as recentlyViewed from "../recentlyViewed.js";
import type * as reviews from "../reviews.js";
import type * as userProfiles from "../userProfiles.js";
import type * as whatsapp_orderNotifications from "../whatsapp/orderNotifications.js";
import type * as whatsapp_queue from "../whatsapp/queue.js";
import type * as whatsapp_whatsappClient from "../whatsapp/whatsappClient.js";
import type * as wishlists from "../wishlists.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  addresses: typeof addresses;
  adminUsers: typeof adminUsers;
  auth: typeof auth;
  cart: typeof cart;
  checkout: typeof checkout;
  counterUtils: typeof counterUtils;
  coupons: typeof coupons;
  crons: typeof crons;
  editorial: typeof editorial;
  "emails/adminEmail": typeof emails_adminEmail;
  "emails/brevoClient": typeof emails_brevoClient;
  "emails/emailLayout": typeof emails_emailLayout;
  "emails/enquiryEmail": typeof emails_enquiryEmail;
  "emails/followUpEmail": typeof emails_followUpEmail;
  "emails/orderEmail": typeof emails_orderEmail;
  "emails/queue": typeof emails_queue;
  "emails/reminderEmail": typeof emails_reminderEmail;
  "emails/restockEmail": typeof emails_restockEmail;
  "emails/reviewEmail": typeof emails_reviewEmail;
  "emails/thankYouEmail": typeof emails_thankYouEmail;
  enquiries: typeof enquiries;
  env: typeof env;
  heroBanners: typeof heroBanners;
  http: typeof http;
  occasions: typeof occasions;
  orders: typeof orders;
  products: typeof products;
  recentSearches: typeof recentSearches;
  recentlyViewed: typeof recentlyViewed;
  reviews: typeof reviews;
  userProfiles: typeof userProfiles;
  "whatsapp/orderNotifications": typeof whatsapp_orderNotifications;
  "whatsapp/queue": typeof whatsapp_queue;
  "whatsapp/whatsappClient": typeof whatsapp_whatsappClient;
  wishlists: typeof wishlists;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("../betterAuth/_generated/component.js").ComponentApi<"betterAuth">;
};
