import carAvoidTowing from "../../../assets/section-images/cars/Avoid unnecessary towing.png";
import carBlocked from "../../../assets/section-images/cars/Blocked driveways & private contact.png";
import carMinorDamage from "../../../assets/section-images/cars/Minor damage & parking scrapes.png";
import carPrivateParking from "../../../assets/section-images/cars/Private parking areas.png";
import carWindowLights from "../../../assets/section-images/cars/Window open or lights on.png";
import keyAnonymous from "../../../assets/section-images/keys/Anonymous return, real privacy.png";
import keyLocksmith from "../../../assets/section-images/keys/Fewer locksmith emergencies.png";
import keyAlerts from "../../../assets/section-images/keys/Instant find alerts & peace of mind.png";
import keyMasterKeys from "../../../assets/section-images/keys/Protection for workplace master keys.png";
import keyBuilding from "../../../assets/section-images/keys/Spare your building’s lock system.png";

export type CarsKeysColumn = "car" | "key";

/** Order matches `useCases.car.features` in EN and DE defaults (same semantic rows). */
const CAR_SECTION_IMAGE_URLS = [
  carMinorDamage,
  carAvoidTowing,
  carWindowLights,
  carBlocked,
  carPrivateParking
] as const;

/** Order matches `useCases.key.features` in EN and DE defaults. */
const KEY_SECTION_IMAGE_URLS = [
  keyBuilding,
  keyAnonymous,
  keyLocksmith,
  keyMasterKeys,
  keyAlerts
] as const;

export function sectionImageForFeature(column: CarsKeysColumn, featureIndex: number): string | undefined {
  const list = column === "car" ? CAR_SECTION_IMAGE_URLS : KEY_SECTION_IMAGE_URLS;
  return list[featureIndex] as string | undefined;
}
