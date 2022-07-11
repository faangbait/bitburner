

/***************************************************************/
/*                     RAM USAGE CONTROL                       */
/* In this section, we define a bunch of "fake" files.         */
/* Using the "fake" imports allows operation on systems with   */
/* lower specifications, albeit at reduced functionality.      */
/***************************************************************/

/***************************************************************/
/*                  SINGULARITY FUNCTIONS                      */
// import { Singularity } from "modules/Singularity";
/*                  SINGULARITY FAKES                          */
import { Singularity } from "modules/SingularityFake";
/***************************************************************/

/***************************************************************/
/*                  FACTION FUNCTIONS                          */
// import { Factions } from "modules/Factions";
/*                  FACTION FAKES                              */
import { Factions } from "modules/FactionsFake";
/***************************************************************/

/***************************************************************/
/*                  CORPORATION FUNCTIONS                      */
// import { Corps } from "modules/Corps";
/*                  CORPORATION FAKES                          */
import { Corps } from "modules/CorpsFake";
/***************************************************************/

/***************************************************************/
/*                  CRIME FUNCTIONS                            */
// import { Crimes } from "modules/Crimes";
/*                  CRIME FAKES                                */
import { Crimes } from "modules/CrimesFake";
/***************************************************************/

/***************************************************************/
/*                  CODING CONTRACT FUNCTIONS                  */
import { LeetCode } from "modules/LeetCode";
/*                  CODING CONTRACT FAKES                      */
// import { LeetCode } from "modules/LeetCodeFake";
/***************************************************************/

/***************************************************************/
/*                  SLEEVE FUNCTIONS                           */
// import { Sleeve } from "modules/Sleeve";
/*                  SLEEVE FAKES                               */
import { Sleeves } from "modules/SleevesFake";
/***************************************************************/

/***************************************************************/
/*                   <MERGE PLACEHOLDER>                       */
/***************************************************************/

/***************************************************************/
/*                  </MERGE PLACEHOLDER>                       */
/***************************************************************/

/***************************************************************/
/*                  USER OVERLOADS                             */
/* I strongly suggest you move these files to a new location.  */
/* You'll probably want to update this software in the future  */
/* without losing all your customizations.                     */

import { HackingStrategy } from "modules/Hack";
import { MoneyStrategy } from "modules/Money";

/***************************************************************/
/* Note: you can overload other parts of this script (except)  */
/* the main loop in a similar manner. Just adjust the imports  */
/* to point to your new location.                              */
/*                                                             */
/* To prevent filename conflicts, this script will never       */
/* prefix a module with "home." or "/home" or any derivative.  */
/***************************************************************/
 
export { Singularity, Factions, Corps, Crimes, LeetCode, Sleeves, MoneyStrategy, HackingStrategy }
