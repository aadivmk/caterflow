/**
 * Shared data shapes, written as JSDoc typedefs.
 *
 * The app is plain JavaScript, so nothing here runs. Editors such as VS Code read these comments
 * and give autocomplete and hover hints wherever a value is annotated with `@type` or `@param`.
 * To use a shape in another file, annotate with the import form, for example
 * `@param {import("@/types").Booking} booking`.
 */

/** @typedef {string} EventType One of EVENT_TYPES in lib/constants.js. */
/** @typedef {string} MealType One of MEAL_TYPES. */
/** @typedef {string} ServiceStyle One of SERVICE_STYLES. */
/** @typedef {string} BookingStatus One of BOOKING_STATUSES. */
/** @typedef {string} PaymentStatus One of PAYMENT_STATUSES. */
/** @typedef {string} MenuCategory One of MENU_CATEGORIES. */
/** @typedef {string} DietaryType One of DIETARY_TYPES. */
/** @typedef {string} Currency One of CURRENCIES. */

/**
 * @typedef {Object} BaseRecord
 * @property {string} id
 * @property {boolean} isDemo True for records that came from the bundled demo dataset.
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {BaseRecord & {
 *   name: string,
 *   phone: string,
 *   email: string,
 *   address: string,
 *   notes: string,
 * }} Customer
 */

/**
 * @typedef {BaseRecord & {
 *   name: string,
 *   category: MenuCategory,
 *   description: string,
 *   pricePerPerson: number,
 *   dietaryType: DietaryType,
 *   imageUrl: string,
 *   isAvailable: boolean,
 * }} MenuItem
 */

/**
 * @typedef {BaseRecord & {
 *   name: string,
 *   description: string,
 *   itemIds: string[],
 *   defaultGuestCount: number,
 * }} Menu
 * itemIds is stored as an ordered array inside the menu document when using MongoDB.
 * defaultGuestCount is the guest count used for the package's estimated total.
 */

/**
 * @typedef {BaseRecord & {
 *   customerId: string,
 *   eventName: string,
 *   eventType: EventType,
 *   eventDate: string,
 *   startTime: string,
 *   endTime: string,
 *   location: string,
 *   guestCount: number,
 *   menuId: string | null,
 *   serviceType: ServiceStyle,
 *   dietaryRequirements: string,
 *   instructions: string,
 *   pricePerPerson: number,
 *   additionalCharges: number,
 *   discount: number,
 *   totalPrice: number,
 *   advanceAmount: number,
 *   remainingBalance: number,
 *   paymentStatus: PaymentStatus,
 *   status: BookingStatus,
 * }} Booking
 * eventDate is yyyy-MM-dd. startTime and endTime are HH:mm (24 hour).
 * pricePerPerson is a snapshot of the menu price when the booking was saved.
 */

/**
 * @typedef {Object} CalculatorAssumptions
 * @property {number} bufferPercent Extra servings prepared on top of the guest count.
 * @property {number} foodPerServingG Total cooked food per serving, in grams.
 * @property {number} ricePerServingG Raw rice per serving, in grams.
 * @property {number} meatPerServingG Raw meat per serving, in grams.
 * @property {number} vegPerServingG Raw vegetables per serving, in grams.
 * @property {number} waterPerServingL Drinking water per serving, in litres.
 * @property {Record<string, number>} mealMultipliers Scales quantities by meal, keyed by MealType.
 * @property {Record<string, number>} guestsPerStaff Guests one staff member can look after, keyed by ServiceStyle.
 * @property {Record<string, number>} eventBufferPercent Extra buffer for specific event types, keyed by EventType.
 */

/**
 * @typedef {Object} CalculatorInput
 * @property {number} guests
 * @property {EventType} eventType
 * @property {MealType} mealType
 * @property {ServiceStyle} serviceStyle
 * @property {number} budgetPerGuest
 */

/**
 * @typedef {Object} CalculatorBreakdownLine
 * @property {string} label
 * @property {string} formula
 * @property {string} value
 */

/**
 * @typedef {Object} CalculatorResult
 * @property {number} servings
 * @property {number} bufferPercent
 * @property {number} foodKg
 * @property {number} riceKg
 * @property {number} meatKg
 * @property {number} vegKg
 * @property {number} waterL
 * @property {number} staff
 * @property {number} budget
 * @property {CalculatorBreakdownLine[]} breakdown
 */

/**
 * @typedef {Object} SavedCalculation
 * @property {string} id
 * @property {string} name
 * @property {CalculatorInput} input
 * @property {CalculatorAssumptions} assumptions
 * @property {CalculatorResult} result
 * @property {string} createdAt
 */

/**
 * @typedef {Object} BusinessSettings
 * @property {string} id
 * @property {string} businessName
 * @property {string} ownerName
 * @property {string} phone
 * @property {string} email
 * @property {string} address
 * @property {string} gstNumber
 * @property {Currency} currency
 * @property {number} defaultPricePerGuest
 * @property {number} cateringTeams Events the business can serve at the same time. Used for conflict checks.
 * @property {number} dailyGuestCapacity Most guests the kitchen can cook for in one day. Used for conflict checks.
 * @property {CalculatorAssumptions} calculatorAssumptions
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AppData
 * @property {Customer[]} customers
 * @property {MenuItem[]} menuItems
 * @property {Menu[]} menus
 * @property {Booking[]} bookings
 * @property {SavedCalculation[]} calculations
 * @property {BusinessSettings} settings
 */

/** @typedef {"customers" | "menuItems" | "menus" | "bookings" | "calculations"} CollectionKey */

/** @typedef {"local" | "mongodb"} DataMode */

/**
 * Result shape shared by Server Actions.
 * @template T
 * @typedef {{ ok: true, data: T } | { ok: false, message: string, fieldErrors?: Record<string, string> }} ActionResult
 */

export {};
