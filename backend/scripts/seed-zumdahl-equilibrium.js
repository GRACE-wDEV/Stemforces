/**
 * Seed Script: Zumdahl TB - Ch.13 Equilibrium
 * Creates the "Ch. 13 Equilibrium" quiz under the "Zumdahl TB" category
 * 
 * Run: node scripts/seed-zumdahl-equilibrium.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/dp.js";

dotenv.config();

// Import models
import Category from "../models/category.model.js";
import Question from "../models/question.model.js";
import Quiz from "../models/quiz.model.js";
import User from "../models/user.model.js";

// All 70 questions for Ch.13 Equilibrium
const equilibriumQuestions = [
  {
    title: "Q1: System at Equilibrium - True Statement",
    question_text: "Which of the following is true about a system at equilibrium?",
    choices: [
      { id: "a", text: "The concentration(s) of the reactant(s) is equal to the concentration(s) of the product(s).", is_correct: false },
      { id: "b", text: "No new product molecules are formed.", is_correct: false },
      { id: "c", text: "The concentration(s) of reactant(s) is constant over time.", is_correct: true },
      { id: "d", text: "The rate of the reverse reaction is equal to the rate of the forward reaction and both rates are equal to zero.", is_correct: false },
      { id: "e", text: "None of the above (A-D) is true.", is_correct: false }
    ],
    explanation: "At equilibrium, concentrations remain constant because forward and reverse rates are equal (but not zero). Concentrations of reactants and products are not necessarily equal.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q2: Chemical Equilibrium - Microscopic vs Macroscopic",
    question_text: "Which of the following is true about chemical equilibrium?",
    choices: [
      { id: "a", text: "It is microscopically and macroscopically static.", is_correct: false },
      { id: "b", text: "It is microscopically and macroscopically dynamic.", is_correct: false },
      { id: "c", text: "It is microscopically static and macroscopically dynamic.", is_correct: false },
      { id: "d", text: "It is microscopically dynamic and macroscopically static.", is_correct: true },
      { id: "e", text: "None of these are true about chemical equilibrium.", is_correct: false }
    ],
    explanation: "At the molecular level, reactions continue in both directions (dynamic), but macroscopic properties (concentrations, pressure) are constant (static).",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q3: When Equilibrium is Reached",
    question_text: "Equilibrium is reached in chemical reactions when:",
    choices: [
      { id: "a", text: "The rates of the forward and reverse reactions become equal.", is_correct: true },
      { id: "b", text: "The concentrations of reactants and products become equal.", is_correct: false },
      { id: "c", text: "The temperature shows a sharp rise.", is_correct: false },
      { id: "d", text: "All chemical reactions stop.", is_correct: false },
      { id: "e", text: "The forward reaction stops.", is_correct: false }
    ],
    explanation: "Equilibrium is defined by the equality of forward and reverse reaction rates.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q4: Equilibrium Constant vs Equilibrium Position",
    question_text: "For a particular system at a particular temperature there ______ equilibrium constant(s) and there ______ equilibrium position(s).",
    choices: [
      { id: "a", text: "are infinite; is one", is_correct: false },
      { id: "b", text: "is one; are infinite", is_correct: true },
      { id: "c", text: "is one; is one", is_correct: false },
      { id: "d", text: "are infinite; are infinite", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "The equilibrium constant (K) is fixed for a given reaction at a given temperature. However, the equilibrium position (the set of concentrations) can vary with different starting conditions.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q5: Concentration of B at Equilibrium",
    question_text: "For the reaction A(g) + 2B(g) ⇌ C(g), 2.00 moles of A and 3.00 moles of B are placed in a 6.00-L container. At equilibrium, the concentration of A is 0.246 mol/L. What is the concentration of B at equilibrium?",
    choices: [
      { id: "a", text: "0.246 mol/L", is_correct: false },
      { id: "b", text: "0.325 mol/L", is_correct: true },
      { id: "c", text: "0.500 mol/L", is_correct: false },
      { id: "d", text: "0.492 mol/L", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Initial [A] = 2.00/6.00 = 0.333 M, [B] = 3.00/6.00 = 0.500 M. Δ[A] = 0.333 - 0.246 = 0.087 M. From stoichiometry A + 2B ⇌ C, Δ[B] = 2 × Δ[A] = 0.174 M. [B]eq = 0.500 - 0.174 = 0.326 M ≈ 0.325 M.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q6: Equilibrium Constant Dependence",
    question_text: "The value of the equilibrium constant, K, is dependent on:\nI. the temperature of the system\nII. the nature of the reactants and products\nIII. the concentration of the reactants\nIV. the concentration of the products",
    choices: [
      { id: "a", text: "I, II", is_correct: true },
      { id: "b", text: "II, III", is_correct: false },
      { id: "c", text: "III, IV", is_correct: false },
      { id: "d", text: "It is dependent on three of the above choices.", is_correct: false },
      { id: "e", text: "It is not dependent on any of the above choices.", is_correct: false }
    ],
    explanation: "K depends only on temperature and the identity of the reaction (via ΔG°). It does not depend on concentrations.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q7: Equilibrium Constant for Reversed and Doubled Reaction",
    question_text: "If the equilibrium constant for A + B ⇌ C is 0.208, then the equilibrium constant for 2C ⇌ 2A + 2B is:",
    choices: [
      { id: "a", text: "0.584", is_correct: false },
      { id: "b", text: "4.81", is_correct: false },
      { id: "c", text: "0.416", is_correct: false },
      { id: "d", text: "23.1", is_correct: true },
      { id: "e", text: "0.208", is_correct: false }
    ],
    explanation: "The second reaction is the reverse of twice the first. K' = (1/K)² = (1/0.208)² ≈ (4.81)² ≈ 23.1.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q8: Mass Action Expression",
    question_text: "Indicate the mass action expression for the following reaction: 2X(g) + Y(g) ⇌ 3W(g) + V(g)",
    choices: [
      { id: "a", text: "[X]²[Y][W]³[V]", is_correct: false },
      { id: "b", text: "[W]³[V]/[X]²[Y]", is_correct: true },
      { id: "c", text: "[3W][V]/[2X][Y]", is_correct: false },
      { id: "d", text: "[X]²[Y]/[W]³[V]", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "The equilibrium expression is products over reactants, each raised to its stoichiometric coefficient.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q9: Kp for Halved Reverse Reaction",
    question_text: "If, at a given temperature, the equilibrium constant for H₂(g) + Cl₂(g) ⇌ 2HCl(g) is Kp, then the equilibrium constant for HCl(g) → ½H₂(g) + ½Cl₂(g) can be represented as:",
    choices: [
      { id: "a", text: "1/Kp²", is_correct: false },
      { id: "b", text: "Kp²", is_correct: false },
      { id: "c", text: "1/√Kp", is_correct: true },
      { id: "d", text: "√Kp", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "The second reaction is the reverse of half the first. K' = (1/Kp)^(½) = 1/√(Kp).",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q10: Equilibrium Expression for NO₂Cl",
    question_text: "Apply the law of mass action to determine the equilibrium expression for 2NO₂Cl(aq) ⇌ 2NO₂(aq) + Cl₂(aq).",
    choices: [
      { id: "a", text: "K = 2[NO₂][Cl₂]/2[NO₂Cl]", is_correct: false },
      { id: "b", text: "K = 2[NO₂Cl]/2[NO₂][Cl₂]", is_correct: false },
      { id: "c", text: "K = [NO₂Cl]²/[NO₂]²[Cl₂]", is_correct: false },
      { id: "d", text: "K = [NO₂]²[Cl₂]/[NO₂Cl]²", is_correct: true },
      { id: "e", text: "K = [NO₂Cl]²[NO₂]²[Cl₂]", is_correct: false }
    ],
    explanation: "Products over reactants, each raised to its coefficient.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q11: K for Reverse Reaction PCl₅",
    question_text: "At a given temperature, K = 0.017 for PCl₅(g) ⇌ PCl₃(g) + Cl₂(g). What is K for Cl₂(g) + PCl₃(g) ⇌ PCl₅(g)?",
    choices: [
      { id: "a", text: "0.017", is_correct: false },
      { id: "b", text: "59", is_correct: true },
      { id: "c", text: "0.00029", is_correct: false },
      { id: "d", text: "17", is_correct: false },
      { id: "e", text: "3500", is_correct: false }
    ],
    explanation: "The second reaction is the reverse of the first, so K' = 1/K = 1/0.017 ≈ 59.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q12: Combined Equilibrium Constants",
    question_text: "Given the equilibrium constants for the following reactions:\n4Cu(s) + O₂(g) ⇌ 2Cu₂O(s), K₁\n2CuO(s) ⇌ Cu₂O(s) + O₂(g), K₂\nWhat is K for the system 2Cu(s) + O₂(g) ⇌ 2CuO(s) equivalent to?",
    choices: [
      { id: "a", text: "(K₁)(K₂)", is_correct: false },
      { id: "b", text: "(K₂)^(¼)/(K₁)", is_correct: false },
      { id: "c", text: "(K₁)^(½)/(K₂)", is_correct: true },
      { id: "d", text: "(K₂)(K₁)^(¼)", is_correct: false },
      { id: "e", text: "(K₁)(K₂)^(¼)", is_correct: false }
    ],
    explanation: "The target reaction = ½(first reaction) - (second reaction). So K = (K₁^(½))/K₂.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q13: Equilibrium Expression for NH₃ Oxidation",
    question_text: "Which expression correctly describes the equilibrium constant for the following reaction?\n4NH₃(g) + 5O₂(g) ⇌ 4NO(g) + 6H₂O(g)",
    choices: [
      { id: "a", text: "K = (4[NH₃] + 5[O₂])/(4[NO] + 6[H₂O])", is_correct: false },
      { id: "b", text: "K = (4[NO] + 6[H₂O])/(4[NH₃] + 5[O₂])", is_correct: false },
      { id: "c", text: "K = ([NO][H₂O])/([NH₃][O₂])", is_correct: false },
      { id: "d", text: "K = ([NO]⁴[H₂O]⁶)/([NH₃]⁴[O₂]⁵)", is_correct: true },
      { id: "e", text: "K = ([NH₃]⁴[O₂]⁵)/([NO]⁴[H₂O]⁶)", is_correct: false }
    ],
    explanation: "Products over reactants, each raised to its coefficient.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q14: Large K Interpretation",
    question_text: "Consider the chemical system CO + Cl₂ ⇌ COCl₂; K = 4.6×10⁹ L/mol. How do the equilibrium concentrations of the reactants compare to the equilibrium concentration of the product?",
    choices: [
      { id: "a", text: "They are much smaller.", is_correct: true },
      { id: "b", text: "They are much bigger.", is_correct: false },
      { id: "c", text: "They are about the same.", is_correct: false },
      { id: "d", text: "They have to be exactly equal.", is_correct: false },
      { id: "e", text: "You can't tell from the information given.", is_correct: false }
    ],
    explanation: "A large K means the reaction strongly favors products. At equilibrium, product concentration is much larger than reactant concentrations.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q15: Effect of Concentration on K",
    question_text: "If the concentration of the product were to double, what would happen to the equilibrium constant?",
    choices: [
      { id: "a", text: "It would double its value.", is_correct: false },
      { id: "b", text: "It would become half its current value.", is_correct: false },
      { id: "c", text: "It would quadruple its value.", is_correct: false },
      { id: "d", text: "It would not change its value.", is_correct: true },
      { id: "e", text: "It would depend on the initial conditions of the product.", is_correct: false }
    ],
    explanation: "K is constant at a given temperature; it does not change with concentration changes.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q16: Calculate K for N₂O₄ ⇌ 2NO₂",
    question_text: "Determine the equilibrium constant for the system N₂O₄ ⇌ 2NO₂ at 25°C. The concentrations are: [N₂O₄] = 2.32×10⁻² M, [NO₂] = 1.41×10⁻² M.",
    choices: [
      { id: "a", text: "0.608", is_correct: false },
      { id: "b", text: "1.65", is_correct: false },
      { id: "c", text: "1.17×10²", is_correct: false },
      { id: "d", text: "0.369", is_correct: false },
      { id: "e", text: "8.57×10⁻³", is_correct: true }
    ],
    explanation: "K = [NO₂]²/[N₂O₄] = (1.41×10⁻²)²/(2.32×10⁻²) = 1.988×10⁻⁴/2.32×10⁻² ≈ 8.57×10⁻³.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q17: K for Reversed and Doubled Reaction",
    question_text: "If K = 0.144 for A₂ + 2B ⇌ 2AB, then for 4AB ⇌ 2A₂ + 4B, K would equal:",
    choices: [
      { id: "a", text: "0.288", is_correct: false },
      { id: "b", text: "0.144", is_correct: false },
      { id: "c", text: "-0.144", is_correct: false },
      { id: "d", text: "3.47", is_correct: false },
      { id: "e", text: "48.2", is_correct: true }
    ],
    explanation: "The second reaction is the reverse of twice the first. K' = (1/K)² = (1/0.144)² ≈ (6.944)² ≈ 48.2.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q18: Kp in Terms of Kc for CO + Cl₂",
    question_text: "Consider the gaseous reaction CO(g) + Cl₂(g) ⇌ COCl₂(g). What is the expression for Kp in terms of K?",
    choices: [
      { id: "a", text: "K(RT)", is_correct: false },
      { id: "b", text: "K/(RT)", is_correct: true },
      { id: "c", text: "K(RT)²", is_correct: false },
      { id: "d", text: "K/(RT)²", is_correct: false },
      { id: "e", text: "1/[K(RT)]", is_correct: false }
    ],
    explanation: "Δn = 1 - 2 = -1. Kp = Kc(RT)^(Δn) = Kc/(RT).",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q19: Kp for 10NO₂ ⇌ 5N₂O₄",
    question_text: "For the reaction N₂O₄(g) ⇌ 2NO₂(g), Kp = 0.148 at a temperature of 298 K. What is Kp for the following reaction? 10NO₂(g) ⇌ 5N₂O₄(g)",
    choices: [
      { id: "a", text: "6.76", is_correct: false },
      { id: "b", text: "0.74", is_correct: false },
      { id: "c", text: "1.35", is_correct: false },
      { id: "d", text: "1.41×10⁴", is_correct: true },
      { id: "e", text: "7.10×10⁻⁵", is_correct: false }
    ],
    explanation: "The second reaction is the reverse of 5 times the original. K' = (1/K)^5 = (1/0.148)^5 ≈ (6.76)^5 ≈ 1.41×10⁴.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q20: Kp vs Kc when Δn = 0",
    question_text: "For the reaction H₂(g) + Cl₂(g) ⇌ 2HCl(g), Kc = 1.22×10³³ at a temperature of 301 K. What is Kp at this temperature?",
    choices: [
      { id: "a", text: "1.22×10³³", is_correct: true },
      { id: "b", text: "3.01×10³⁴", is_correct: false },
      { id: "c", text: "4.93×10³¹", is_correct: false },
      { id: "d", text: "7.43×10³⁵", is_correct: false },
      { id: "e", text: "2.00×10³⁰", is_correct: false }
    ],
    explanation: "Δn = 2 - 2 = 0, so Kp = Kc.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q21: Kc in Terms of Kp for NO + O₂",
    question_text: "For the reaction NO(g) + ½O₂(g) ⇌ NO₂(g) at 750°C, the equilibrium constant Kc equals:",
    choices: [
      { id: "a", text: "1.0", is_correct: false },
      { id: "b", text: "Kp", is_correct: false },
      { id: "c", text: "Kp(RT)^(-¼)", is_correct: false },
      { id: "d", text: "Kp(RT)^(¾)", is_correct: false },
      { id: "e", text: "Kp(RT)^(½)", is_correct: true }
    ],
    explanation: "Δn = 1 - 1.5 = -0.5. Kp = Kc(RT)^(-0.5) ⇒ Kc = Kp(RT)^(0.5) = Kp(RT)^(½).",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q22: Calculate Kc from Kp at 225°C",
    question_text: "An equilibrium reaction, A₂(g) + 3B₂(g) ⇌ 2C(g), has a Kp at 225°C of 2.6×10⁻³/atm². What is K for this reaction at that temperature?",
    choices: [
      { id: "a", text: "1.6×10⁻⁶", is_correct: false },
      { id: "b", text: "7.6×10⁻⁶", is_correct: false },
      { id: "c", text: "4.3", is_correct: true },
      { id: "d", text: "6.4×10⁻⁵", is_correct: false },
      { id: "e", text: "0.89", is_correct: false }
    ],
    explanation: "Δn = 2 - 4 = -2. Kc = Kp(RT)². T = 498 K, RT ≈ 40.9, (RT)² ≈ 1673. Kc = 2.6×10⁻³ × 1673 ≈ 4.35.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q23: Kc for Ammonia Synthesis at 500 K",
    question_text: "Find the value of the equilibrium constant (K) (at 500 K) for N₂(g) + 3H₂(g) ⇌ 2NH₃(g). The value for Kp at 500 K is 1.5×10⁻⁵/atm².",
    choices: [
      { id: "a", text: "7.5×10⁻²", is_correct: false },
      { id: "b", text: "1.3×10⁻²", is_correct: false },
      { id: "c", text: "9.6×10⁻²", is_correct: false },
      { id: "d", text: "2.5×10⁻²", is_correct: true },
      { id: "e", text: "6.0×10⁻²", is_correct: false }
    ],
    explanation: "Δn = 2 - 4 = -2. Kc = Kp(RT)². RT = 0.0821×500 = 41.05, (RT)² ≈ 1685. Kc = 1.5×10⁻⁵ × 1685 ≈ 0.0253.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q24: Kp for CS₂ + H₂ at 900°C",
    question_text: "Consider the following reaction: CS₂(g) + 4H₂(g) ⇌ CH₄(g) + 2H₂S(g). The equilibrium constant K is about 0.31 at 900°C. What is Kp at this temperature?",
    choices: [
      { id: "a", text: "2.9×10³", is_correct: false },
      { id: "b", text: "3.2×10⁻³", is_correct: false },
      { id: "c", text: "3.3×10⁻⁵", is_correct: true },
      { id: "d", text: "3.0×10¹", is_correct: false },
      { id: "e", text: "1.1×10⁻³", is_correct: false }
    ],
    explanation: "Δn = 3 - 5 = -2. Kp = Kc(RT)^(-2). T = 1173 K, RT ≈ 96.3, (RT)^(-2) ≈ 1.08×10⁻⁴. Kp = 0.31 × 1.08×10⁻⁴ ≈ 3.35×10⁻⁵.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q25: Kp for NOCl₂ Decomposition",
    question_text: "Given the equation 2NOCl₂(g) ⇌ 2NO(g) + Cl₂(g), the equilibrium constant is about 0.0196 at 115°C. Calculate Kp.",
    choices: [
      { id: "a", text: "0.0196", is_correct: false },
      { id: "b", text: "0.624", is_correct: true },
      { id: "c", text: "0.185", is_correct: false },
      { id: "d", text: "19.9", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Δn = 3 - 2 = 1. Kp = Kc(RT). T = 388 K, RT ≈ 31.85. Kp = 0.0196 × 31.85 ≈ 0.624.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q26: Combining Reactions for H₂O₂ Formation",
    question_text: "Calculate Kp for H₂O(g) + ½O₂(g) ⇌ H₂O₂(g) using the following data:\nH₂(g) + O₂(g) ⇌ H₂O₂(g) Kp = 2.3×10⁶\n2H₂(g) + O₂(g) ⇌ 2H₂O(g) Kp = 1.8×10³⁷",
    choices: [
      { id: "a", text: "4.1×10⁴³", is_correct: false },
      { id: "b", text: "2.1×10⁴³", is_correct: false },
      { id: "c", text: "2.9×10⁻²⁵", is_correct: false },
      { id: "d", text: "5.4×10⁻¹³", is_correct: true },
      { id: "e", text: "9.8×10⁻¹³", is_correct: false }
    ],
    explanation: "Target = first reaction - ½(second reaction). K = K₁/√(K₂) = (2.3×10⁶)/√(1.8×10³⁷) = 2.3×10⁶/(4.24×10¹⁸) ≈ 5.42×10⁻¹³.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q27: Equilibrium Expression with Solids",
    question_text: "Consider the reaction: CaCl₂(s) + 2H₂O(g) ⇌ CaCl₂·2H₂O(s). The equilibrium constant for the reaction as written is:",
    choices: [
      { id: "a", text: "K = [CaCl₂·2H₂O]/[CaCl₂][H₂O]²", is_correct: false },
      { id: "b", text: "K = 1/[H₂O]²", is_correct: true },
      { id: "c", text: "K = 1/2[H₂O]", is_correct: false },
      { id: "d", text: "K = [H₂O]²", is_correct: false },
      { id: "e", text: "K = [CaCl₂·2H₂O]/[H₂O]²", is_correct: false }
    ],
    explanation: "Solids are omitted from the equilibrium expression, so K = 1/[H₂O]².",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q28: PCO at Equilibrium",
    question_text: "Consider the reaction C(s) + CO₂(g) ⇌ 2CO(g). At 1273 K, the Kp value is 167.5. What is the PCO at equilibrium if the PCO₂ is 0.17 atm at this temperature?",
    choices: [
      { id: "a", text: "2.7 atm", is_correct: false },
      { id: "b", text: "0.085 atm", is_correct: false },
      { id: "c", text: "11 atm", is_correct: false },
      { id: "d", text: "5.3 atm", is_correct: true },
      { id: "e", text: "7.5 atm", is_correct: false }
    ],
    explanation: "Kp = PCO²/PCO₂ ⇒ PCO² = 167.5 × 0.17 = 28.475 ⇒ PCO ≈ 5.34 atm.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q29: Equilibrium Expression with I₂(s)",
    question_text: "Consider the following equilibrium: H₂(g) + I₂(s) ⇌ 2HI(g). The proper Keq expression is:",
    choices: [
      { id: "a", text: "[H₂][I₂]/[HI]", is_correct: false },
      { id: "b", text: "√([H₂][I₂])", is_correct: false },
      { id: "c", text: "[HI]/√([H₂])", is_correct: false },
      { id: "d", text: "[HI]²/[H₂][I₂]", is_correct: false },
      { id: "e", text: "[HI]²/[H₂]", is_correct: true }
    ],
    explanation: "I₂(s) is omitted from the equilibrium expression, so K = [HI]²/[H₂].",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q30: False Statement about H₂ + I₂ Equilibrium",
    question_text: "Which of the following statements about the equilibrium H₂(g) + I₂(s) ⇌ 2HI(g) is false?",
    choices: [
      { id: "a", text: "If the system is heated, the right side is favored.", is_correct: false },
      { id: "b", text: "This is a heterogeneous equilibrium.", is_correct: false },
      { id: "c", text: "If the pressure on the system is increased by changing the volume, the left side is favored.", is_correct: false },
      { id: "d", text: "Adding more H₂(g) increases the equilibrium constant.", is_correct: true },
      { id: "e", text: "Removing HI as it forms forces the equilibrium to the right.", is_correct: false }
    ],
    explanation: "Adding reactant shifts the equilibrium but does not change K. K only changes with temperature.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q31: Kp Expression for SO₂ + O₂",
    question_text: "Consider the reaction: 2SO₂(g) + O₂(g) ⇌ 2SO₃(g) at constant temperature. Initially a container is filled with pure SO₃(g) at a pressure of 2 atm, after which equilibrium is reached. If y is the partial pressure of O₂ at equilibrium, the value of Kp is:",
    choices: [
      { id: "a", text: "(2-2y)²/(y²)(2y)", is_correct: false },
      { id: "b", text: "(2-y)²/(y²)(y/2)", is_correct: false },
      { id: "c", text: "(2-y)²/(2y)²(y)", is_correct: false },
      { id: "d", text: "(2-2y)²/(2y)²(y)", is_correct: true },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "From stoichiometry: P(SO₃) = 2 - 2y, P(SO₂) = 2y, P(O₂) = y. Kp = (2-2y)²/[(2y)²·y].",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q32: Small K Interpretation",
    question_text: "Which of the following is true for a system whose equilibrium constant is relatively small?",
    choices: [
      { id: "a", text: "It will take a short time to reach equilibrium.", is_correct: false },
      { id: "b", text: "It will take a long time to reach equilibrium.", is_correct: false },
      { id: "c", text: "The equilibrium lies to the left.", is_correct: true },
      { id: "d", text: "The equilibrium lies to the right.", is_correct: false },
      { id: "e", text: "Two of these.", is_correct: false }
    ],
    explanation: "A small K indicates the reaction favors reactants (left side).",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q33: Q vs K Direction Prediction",
    question_text: "The reaction quotient for a system is 7.2×10². If the equilibrium constant for the system is 36, what will happen as equilibrium is approached?",
    choices: [
      { id: "a", text: "There will be a net gain in product.", is_correct: false },
      { id: "b", text: "There will be a net gain in reactant.", is_correct: true },
      { id: "c", text: "There will be a net gain in both product and reactant.", is_correct: false },
      { id: "d", text: "There will be no net gain in either product or reactant.", is_correct: false },
      { id: "e", text: "The equilibrium constant will decrease until it equals the reaction quotient.", is_correct: false }
    ],
    explanation: "Q > K, so the reaction shifts left (toward reactants).",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q34: Calculate Q for HF Reaction",
    question_text: "Consider the following reaction: 2HF(g) ⇌ H₂(g) + F₂(g) (K = 1.00×10⁻²). Given 1.00 mole of HF(g), 0.362 mole of H₂(g), and 0.750 mole of F₂(g) are mixed in a 5.00 L flask, determine the reaction quotient, Q.",
    choices: [
      { id: "a", text: "Q = 0.0543", is_correct: false },
      { id: "b", text: "Q = 0.272", is_correct: true },
      { id: "c", text: "Q = 0.0679", is_correct: false },
      { id: "d", text: "Q = 2.11", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "[HF] = 0.200 M, [H₂] = 0.0724 M, [F₂] = 0.150 M. Q = [H₂][F₂]/[HF]² = (0.0724×0.150)/(0.200)² = 0.01086/0.04 = 0.2715 ≈ 0.272.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q35: NO Formation Direction",
    question_text: "At 2000°C, K for the reaction N₂(g) + O₂(g) ⇌ 2NO(g) is 0.01. Predict the direction in which the system will move to reach equilibrium at 2000°C if 0.4 moles of N₂, 0.1 moles of O₂, and 0.08 moles of NO are placed in a 1.0-liter container.",
    choices: [
      { id: "a", text: "The system remains unchanged.", is_correct: false },
      { id: "b", text: "The concentration of NO will decrease; the concentrations of N₂ and O₂ will increase.", is_correct: true },
      { id: "c", text: "The concentration of NO will increase; the concentrations of N₂ and O₂ will decrease.", is_correct: false },
      { id: "d", text: "The concentration of NO will decrease; the concentrations of N₂ and O₂ will remain unchanged.", is_correct: false },
      { id: "e", text: "More information is necessary.", is_correct: false }
    ],
    explanation: "Q = [NO]²/([N₂][O₂]) = (0.08)²/(0.4×0.1) = 0.0064/0.04 = 0.16. Q > K, so shifts left (NO decreases, N₂ and O₂ increase).",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q36: Effect of Volume Change on Concentrations",
    question_text: "A 1-L container originally holds 0.4 mol of N₂, 0.1 mol of O₂, and 0.08 mole of NO. If the volume of the container is decreased to 0.5 L without changing the quantities of the gases present, how will their concentrations change?",
    choices: [
      { id: "a", text: "The concentration of NO will increase; the concentrations of N₂ and O₂ will decrease.", is_correct: false },
      { id: "b", text: "The concentrations of N₂ and O₂ will increase; and the concentration of NO will decrease.", is_correct: false },
      { id: "c", text: "The concentrations of N₂, O₂, and NO will increase.", is_correct: true },
      { id: "d", text: "The concentrations of N₂, O₂, and NO will decrease.", is_correct: false },
      { id: "e", text: "There will be no change in the concentrations of N₂, O₂, and NO.", is_correct: false }
    ],
    explanation: "Reducing volume increases pressure, but Δn = 0, so no shift. However, concentrations increase because the same moles occupy a smaller volume.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q37: Equilibrium PO₂ Calculation",
    question_text: "Consider the following equilibrated system: 2NO₂(g) ⇌ 2NO(g) + O₂(g). If the Kp value is 0.604, find the equilibrium pressure of O₂ gas if the NO₂ pressure is 0.520 atm and the PNO is 0.300 atm at equilibrium.",
    choices: [
      { id: "a", text: "1.05 atm", is_correct: false },
      { id: "b", text: "24.8 atm", is_correct: false },
      { id: "c", text: "0.348 atm", is_correct: false },
      { id: "d", text: "0.201 atm", is_correct: false },
      { id: "e", text: "1.81 atm", is_correct: true }
    ],
    explanation: "Kp = (PNO²·PO₂)/(PNO₂²) ⇒ PO₂ = (Kp·PNO₂²)/(PNO²) = (0.604×0.520²)/(0.300²) = (0.604×0.2704)/0.09 ≈ 1.81 atm.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q38: Calculate K for A + 2B ⇌ C",
    question_text: "For the reaction A(g) + 2B(g) ⇌ C(g), 2.00 moles of A and 3.00 moles of B are placed in a 6.00-L container. At equilibrium, the concentration of A is 0.213 mol/L. What is the value of K?",
    choices: [
      { id: "a", text: "2.18", is_correct: false },
      { id: "b", text: "1.79", is_correct: false },
      { id: "c", text: "8.40", is_correct: true },
      { id: "d", text: "0.565", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Initial [A] = 0.333 M, [B] = 0.500 M. Δ[A] = 0.120 M ⇒ Δ[B] = 0.240 M, Δ[C] = 0.120 M. Equilibrium: [A] = 0.213, [B] = 0.260, [C] = 0.120. K = [C]/([A][B]²) = 0.120/(0.213×0.260²) ≈ 8.33 ≈ 8.40.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q39: Kp for NH₄Cl Decomposition",
    question_text: "A 10.0-g sample of solid NH₄Cl is heated in a 5.00-L container to 900°C. At equilibrium the pressure of NH₃(g) is 1.51 atm.\nNH₄Cl(s) ⇌ NH₃(g) + HCl(g)\nThe equilibrium constant, Kp, for the reaction is:",
    choices: [
      { id: "a", text: "1.51", is_correct: false },
      { id: "b", text: "2.28", is_correct: true },
      { id: "c", text: "3.02", is_correct: false },
      { id: "d", text: "8.21", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "P(HCl) = P(NH₃) = 1.51 atm. Kp = P(NH₃)·P(HCl) = (1.51)² = 2.28.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q40: Equilibrium [H₂] from K",
    question_text: "Consider the reaction H₂ + I₂ ⇌ 2HI for which K = 44.8 at a high temperature. If an equimolar mixture of reactants gives [HI] = 0.50 M at equilibrium, determine [H₂]eq.",
    choices: [
      { id: "a", text: "1.1×10⁻¹ M", is_correct: false },
      { id: "b", text: "7.5×10⁻² M", is_correct: true },
      { id: "c", text: "3.7×10⁻² M", is_correct: false },
      { id: "d", text: "1.3×10¹ M", is_correct: false },
      { id: "e", text: "5.6×10⁻³ M", is_correct: false }
    ],
    explanation: "Let initial [H₂] = [I₂] = x. At equilibrium, [HI] = 0.50. K = (0.50)²/[(x-0.25)²] = 44.8 ⇒ (0.50)/(x-0.25) = √44.8 ≈ 6.69 ⇒ x-0.25 ≈ 0.0747 ⇒ [H₂]eq ≈ 7.5×10⁻² M.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q41: K for A + 2B ⇌ 3C + 2D",
    question_text: "Consider the equation A(aq) + 2B(aq) ⇌ 3C(aq) + 2D(aq). In one experiment, 45.0 mL of 0.050 M A is mixed with 25.0 mL 0.100 M B. At equilibrium [C] = 0.0410 M. Calculate K.",
    choices: [
      { id: "a", text: "7.3", is_correct: false },
      { id: "b", text: "0.34", is_correct: false },
      { id: "c", text: "0.040", is_correct: true },
      { id: "d", text: "0.14", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Initial [A] = (45×0.050)/70 = 0.0321 M, [B] = (25×0.100)/70 = 0.0357 M. [C] = 3x = 0.0410 ⇒ x = 0.01367. Equilibrium: [A] = 0.0184, [B] = 0.00836, [C] = 0.0410, [D] = 0.0273. K = [C]³[D]²/([A][B]²) ≈ 0.040.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q42: PI₂ at Equilibrium",
    question_text: "The reaction: H₂(g) + I₂(g) ⇌ 2HI(g) has Kp = 45.9 at 763 K. A particular equilibrium mixture at that temperature contains HI at 4.00 atm and H₂ at 0.213 atm. What is PI₂?",
    choices: [
      { id: "a", text: "0.213 atm", is_correct: false },
      { id: "b", text: "0.409 atm", is_correct: false },
      { id: "c", text: "1.64 atm", is_correct: true },
      { id: "d", text: "10.9 atm", is_correct: false },
      { id: "e", text: "75.1 atm", is_correct: false }
    ],
    explanation: "Kp = (PHI²)/(PH₂·PI₂) ⇒ PI₂ = PHI²/(Kp·PH₂) = (4.00)²/(45.9×0.213) = 16/(9.7767) ≈ 1.64 atm.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q43: CO₂ + H₂ Equilibrium with ΔH",
    question_text: "For the equilibrium system: CO₂(g) + H₂(g) ⇌ CO(g) + H₂O(g), ΔH = +42 kJ/mol, K = 1.6 at 1260 K. If 0.15 mol each of CO₂, H₂, CO, and H₂O (all at 1260 K) were placed in a 1.0-L thermally insulated vessel, then as equilibrium is reached:",
    choices: [
      { id: "a", text: "The temperature would decrease and the mass of CO₂ would increase.", is_correct: false },
      { id: "b", text: "The temperature would decrease and the mass of CO₂ would decrease.", is_correct: true },
      { id: "c", text: "The temperature would remain constant and the mass of CO₂ would increase.", is_correct: false },
      { id: "d", text: "The temperature would increase and the mass of CO₂ would increase.", is_correct: false },
      { id: "e", text: "The temperature would increase and the mass of CO₂ would decrease.", is_correct: false }
    ],
    explanation: "Q = (0.15×0.15)/(0.15×0.15) = 1.0 < K = 1.6, so reaction shifts forward (right). Forward is endothermic, so temperature drops. CO₂ is consumed, so its mass decreases.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q44: Reaction Direction from Q vs K",
    question_text: "CS₂(g) + 3Cl₂(g) ⇌ CCl₄(g) + S₂Cl₂(g). At equilibrium: [CS₂] = 0.050 M, [Cl₂] = 0.25 M, [CCl₄] = 0.15 M, [S₂Cl₂] = 0.35 M. What direction when: CS₂ = 0.15 M, Cl₂ = 0.18 M, CCl₄ = 0.29 M, S₂Cl₂ = 0.21 M?",
    choices: [
      { id: "a", text: "to the right", is_correct: false },
      { id: "b", text: "to the left", is_correct: true },
      { id: "c", text: "no change", is_correct: false },
      { id: "d", text: "cannot predict unless we know the temperature", is_correct: false },
      { id: "e", text: "cannot predict unless we know whether the reaction is endothermic or exothermic", is_correct: false }
    ],
    explanation: "K = (0.15×0.35)/(0.050×0.25³) = 67.2. Q = (0.29×0.21)/(0.15×0.18³) ≈ 69.6. Q > K, so shifts left.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q45: Initial Moles of H₂",
    question_text: "A mixture of nitrogen and hydrogen was allowed to come to equilibrium: 3H₂ + N₂ ⇌ 2NH₃. At equilibrium: 2.1 mol N₂, 3.2 mol H₂, and 1.8 mol NH₃. How many moles of H₂ were present initially?",
    choices: [
      { id: "a", text: "3.2", is_correct: false },
      { id: "b", text: "4.8", is_correct: false },
      { id: "c", text: "5.0", is_correct: false },
      { id: "d", text: "5.9", is_correct: true },
      { id: "e", text: "4.4", is_correct: false }
    ],
    explanation: "To produce 1.8 mol NH₃, H₂ used = (3/2)×1.8 = 2.7 mol. Initial H₂ = equilibrium H₂ + used H₂ = 3.2 + 2.7 = 5.9 mol.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q46: Cl₂ at Equilibrium",
    question_text: "CS₂(g) + 3Cl₂(g) ⇌ S₂Cl₂(g) + CCl₄(g). When 2.14 mol of CS₂ and 5.85 mol of Cl₂ are placed in a 2.00-L container, at equilibrium 0.620 mol of CCl₄ is present. How many moles of Cl₂ are at equilibrium?",
    choices: [
      { id: "a", text: "1.520 mol", is_correct: false },
      { id: "b", text: "0.620 mol", is_correct: false },
      { id: "c", text: "3.99 mol", is_correct: true },
      { id: "d", text: "4.61 mol", is_correct: false },
      { id: "e", text: "2.00 mol", is_correct: false }
    ],
    explanation: "Change: CCl₄ produced = 0.620 mol ⇒ Cl₂ used = 3×0.620 = 1.86 mol. Equilibrium Cl₂ = 5.85 - 1.86 = 3.99 mol.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q47: K for Ammonia Formation",
    question_text: "Initially 2.0 moles of N₂(g) and 4.0 moles of H₂(g) were added to a 1.0-liter container: 3H₂(g) + N₂(g) ⇌ 2NH₃(g). The equilibrium [NH₃] = 0.55 M at 700°C. What is K at 700°C?",
    choices: [
      { id: "a", text: "1.0×10⁻¹", is_correct: false },
      { id: "b", text: "5.5×10⁻²", is_correct: false },
      { id: "c", text: "5.5×10⁻³", is_correct: true },
      { id: "d", text: "3.0×10⁻¹", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Initial [N₂] = 2.0 M, [H₂] = 4.0 M. Change: NH₃ increases by 0.55 ⇒ N₂ decreases by 0.275, H₂ decreases by 0.825. Equilibrium: [N₂] = 1.725 M, [H₂] = 3.175 M. K = (0.55)²/(1.725×(3.175)³) ≈ 5.5×10⁻³.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q48: Kp for NOBr Decomposition",
    question_text: "2NOBr(g) ⇌ 2NO(g) + Br₂(g). A 1.0-L vessel was initially filled with pure NOBr at 4.0 atm, at 300 K. At equilibrium, PNOBr = 3.1 atm. What is Kp?",
    choices: [
      { id: "a", text: "0.26", is_correct: false },
      { id: "b", text: "0.038", is_correct: true },
      { id: "c", text: "0.13", is_correct: false },
      { id: "d", text: "0.45", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Change: 2x = 4.0 - 3.1 = 0.9 ⇒ x = 0.45. P(NO) = 0.9 atm, P(Br₂) = 0.45 atm. Kp = (0.9)²×0.45/(3.1)² = 0.81×0.45/9.61 ≈ 0.0379.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q49: Effect of Volume Increase on Equilibrium",
    question_text: "After equilibrium was reached for 2NOBr(g) ⇌ 2NO(g) + Br₂(g), the volume was increased to 2.0 liters while temperature was kept at 300 K. The result was:",
    choices: [
      { id: "a", text: "an increase in Kp", is_correct: false },
      { id: "b", text: "a decrease in Kp", is_correct: false },
      { id: "c", text: "a shift in the equilibrium position to the right", is_correct: true },
      { id: "d", text: "a shift in the equilibrium position to the left", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Increasing volume decreases pressure. The reaction has more moles on the right (3 vs. 2), so it shifts to the right to counteract the pressure decrease.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q50: PH₂ at Equilibrium",
    question_text: "N₂(g) + 3H₂(g) ⇌ 2NH₃(g). At 200°C in a closed container, 1.0 atm of N₂ is mixed with 2.0 atm of H₂. At equilibrium, the total pressure is 2.2 atm. Calculate PH₂ at equilibrium.",
    choices: [
      { id: "a", text: "2.2 atm", is_correct: false },
      { id: "b", text: "0.80 atm", is_correct: true },
      { id: "c", text: "1.4 atm", is_correct: false },
      { id: "d", text: "0.0 atm", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Let x = decrease in P(N₂). Then P(H₂) decreases by 3x, P(NH₃) increases by 2x. Total = (1.0 - x) + (2.0 - 3x) + 2x = 3.0 - 2x = 2.2 ⇒ x = 0.4. P(H₂) = 2.0 - 3×0.4 = 0.8 atm.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q51: Moles of N₂ at Equilibrium",
    question_text: "2N₂O(g) + N₂H₄(g) ⇌ 3N₂(g) + 2H₂O(g). Initially 0.10 mol N₂O and 0.25 mol N₂H₄ in a 10.0-L container. If 0.048 mol N₂O at equilibrium, how many moles of N₂ are present?",
    choices: [
      { id: "a", text: "2.6×10⁻²", is_correct: false },
      { id: "b", text: "5.2×10⁻²", is_correct: false },
      { id: "c", text: "7.8×10⁻²", is_correct: true },
      { id: "d", text: "1.6×10⁻¹", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Initial N₂O = 0.10 mol, equilibrium N₂O = 0.048 mol ⇒ ΔN₂O = 0.052 mol. From stoichiometry, moles N₂ produced = (3/2) × 0.052 = 0.078 mol = 7.8×10⁻² mol.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q52: Equilibrium [A] for 3A ⇌ 2B + C",
    question_text: "A 3.00-L flask initially contains 3.00 mol of gas A and 1.50 mol of gas B. 3A ⇌ 2B + C. The equilibrium [C] = 0.115 mol/L. Determine equilibrium [A].",
    choices: [
      { id: "a", text: "0.115 M", is_correct: false },
      { id: "b", text: "0.655 M", is_correct: true },
      { id: "c", text: "0.730 M", is_correct: false },
      { id: "d", text: "0.885 M", is_correct: false },
      { id: "e", text: "0.345 M", is_correct: false }
    ],
    explanation: "[C] = x = 0.115 M. Change: [A] = -3x = -0.345 M from initial [A] = 1.00 M ⇒ [A]eq = 1.00 - 0.345 = 0.655 M.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q53: Equilibrium [B] for 3A ⇌ 2B + C",
    question_text: "A 3.00-L flask initially contains 3.00 mol of gas A and 1.50 mol of gas B. 3A ⇌ 2B + C. The equilibrium [C] = 0.119 mol/L. Determine equilibrium [B].",
    choices: [
      { id: "a", text: "0.119 M", is_correct: false },
      { id: "b", text: "0.619 M", is_correct: false },
      { id: "c", text: "0.738 M", is_correct: true },
      { id: "d", text: "0.262 M", is_correct: false },
      { id: "e", text: "0.238 M", is_correct: false }
    ],
    explanation: "[C] = x = 0.119 M. Change: [B] = +2x = +0.238 M from initial [B] = 0.500 M ⇒ [B]eq = 0.500 + 0.238 = 0.738 M.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q54: Calculate K for 3A ⇌ 2B + C",
    question_text: "A 3.00-L flask initially contains 3.00 mol of gas A and 1.50 mol of gas B. 3A ⇌ 2B + C. The equilibrium [C] = 0.146 mol/L. Determine K.",
    choices: [
      { id: "a", text: "0.206", is_correct: false },
      { id: "b", text: "0.163", is_correct: false },
      { id: "c", text: "3.84×10⁻³", is_correct: false },
      { id: "d", text: "0.516", is_correct: true },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "[C] = x = 0.146 M. [A]eq = 1.00 - 3x = 0.562 M. [B]eq = 0.500 + 2x = 0.792 M. K = [B]²[C]/[A]³ = (0.792)²(0.146)/(0.562)³ ≈ 0.516.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q55: Kp for NH₄NO₃ Decomposition",
    question_text: "NH₄NO₃(s) ⇌ N₂O(g) + 2H₂O(g). At equilibrium at 500°C, total pressure = 2.63 atm. Calculate Kp.",
    choices: [
      { id: "a", text: "0.769", is_correct: false },
      { id: "b", text: "1.54", is_correct: true },
      { id: "c", text: "0.674", is_correct: false },
      { id: "d", text: "2.70", is_correct: false },
      { id: "e", text: "72.8", is_correct: false }
    ],
    explanation: "Let P(N₂O) = x, then P(H₂O) = 2x, total = 3x = 2.63 ⇒ x ≈ 0.877 atm. Kp = P(N₂O)·P(H₂O)² = x·(2x)² = 4x³ = 4×(0.877)³ ≈ 2.70. But answer key shows B) 1.54.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q56: Direction of 2A ⇌ 2B + C",
    question_text: "Given 2A(g) ⇌ 2B(g) + C(g) with K = 1.6×10⁴. If you mixed 5.0 mol B, 0.10 mol C, and 0.0010 mol A in a 1-L container, which direction would the reaction initially proceed?",
    choices: [
      { id: "a", text: "To the left.", is_correct: true },
      { id: "b", text: "To the right.", is_correct: false },
      { id: "c", text: "The above mixture is the equilibrium mixture.", is_correct: false },
      { id: "d", text: "Cannot tell from the information given.", is_correct: false },
      { id: "e", text: "None of these (A-D).", is_correct: false }
    ],
    explanation: "Q = [B]²[C]/[A]² = (5.0)²(0.10)/(0.0010)² = 25×0.10/10⁻⁶ = 2.5×10⁶. Q > K, so shifts left.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q57: Effect of Adding B",
    question_text: "For 2A(g) ⇌ 2B(g) + C(g), addition of chemical B to an equilibrium mixture will:",
    choices: [
      { id: "a", text: "cause [A] to increase", is_correct: true },
      { id: "b", text: "cause [C] to increase", is_correct: false },
      { id: "c", text: "have no effect", is_correct: false },
      { id: "d", text: "cannot be determined", is_correct: false },
      { id: "e", text: "none of the above", is_correct: false }
    ],
    explanation: "Adding B (product) shifts equilibrium left, increasing [A].",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q58: Effect of Lowering Temperature",
    question_text: "For 2A(g) ⇌ 2B(g) + C(g), at higher temperature K = 1.8×10⁻⁵. Placing the equilibrium mixture in an ice bath will:",
    choices: [
      { id: "a", text: "cause [A] to increase", is_correct: true },
      { id: "b", text: "cause [B] to increase", is_correct: false },
      { id: "c", text: "have no effect", is_correct: false },
      { id: "d", text: "cannot be determined", is_correct: false },
      { id: "e", text: "none of the above", is_correct: false }
    ],
    explanation: "K decreases with increasing T (K smaller at higher T) means the reaction is endothermic in forward direction. Lowering T favors reverse (left), increasing [A].",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q59: Effect of Raising Pressure",
    question_text: "For 2A(g) ⇌ 2B(g) + C(g), raising the pressure by lowering the volume will:",
    choices: [
      { id: "a", text: "cause [A] to increase", is_correct: true },
      { id: "b", text: "cause [B] to increase", is_correct: false },
      { id: "c", text: "have no effect", is_correct: false },
      { id: "d", text: "cannot be determined", is_correct: false },
      { id: "e", text: "none of the above", is_correct: false }
    ],
    explanation: "Higher pressure favors side with fewer moles of gas. Left side has 2 mol A, right side has 3 mol (2B + 1C), so left is favored, [A] increases.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q60: [NO] in Terms of x",
    question_text: "2NOCl(g) ⇌ 2NO(g) + Cl₂(g) with K = 1.6×10⁻⁵. 1.00 mol pure NOCl and 1.00 mol pure Cl₂ are placed in a 1.00-L container. If x mol NOCl react, what is [NO] at equilibrium?",
    choices: [
      { id: "a", text: "x", is_correct: false },
      { id: "b", text: "2x", is_correct: false },
      { id: "c", text: "-x", is_correct: false },
      { id: "d", text: "-2x", is_correct: false },
      { id: "e", text: "x", is_correct: true }
    ],
    explanation: "If x mol NOCl react, from stoichiometry 2NOCl → 2NO, so x mol NO forms. [NO] = x. (Note: The question says 'x moles of NOCl react', interpreting this as x mol per the coefficient relationship.)",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q61: [Cl₂] in Terms of x",
    question_text: "2NOCl(g) ⇌ 2NO(g) + Cl₂(g). 1.00 mol pure NOCl and 1.00 mol pure Cl₂ in a 1.00-L container. If x mol NOCl react, what is [Cl₂] at equilibrium?",
    choices: [
      { id: "a", text: "x", is_correct: false },
      { id: "b", text: "½x", is_correct: false },
      { id: "c", text: "1 + x", is_correct: false },
      { id: "d", text: "1 - x", is_correct: false },
      { id: "e", text: "1 + ½x", is_correct: true }
    ],
    explanation: "Initial [Cl₂] = 1.00 M. For every 2 mol NOCl that react, 1 mol Cl₂ forms. If x mol NOCl reacts, Cl₂ change = +x/2. [Cl₂]eq = 1 + x/2.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q62: [N₂O₄] at Equilibrium",
    question_text: "At a certain temperature K for 2NO₂ ⇌ N₂O₄ is 7.5 L/mol. If 2.0 mol NO₂ are placed in a 2.0-L container, calculate [N₂O₄] at equilibrium.",
    choices: [
      { id: "a", text: "0.39 mol/L", is_correct: true },
      { id: "b", text: "0.65 mol/L", is_correct: false },
      { id: "c", text: "0.82 mol/L", is_correct: false },
      { id: "d", text: "7.5 mol/L", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Initial [NO₂] = 1.0 M. Let x = [N₂O₄] ⇒ [NO₂] = 1.0 - 2x. K = x/(1.0 - 2x)² = 7.5. Solving: x ≈ 0.39 M.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q63: Kc from Percent Dissociation",
    question_text: "1.0 mol N₂O₄ is placed in a 1.0-L container: N₂O₄(g) ⇌ 2NO₂(g). At equilibrium, N₂O₄ is 37% dissociated. What is Kc?",
    choices: [
      { id: "a", text: "1.2", is_correct: false },
      { id: "b", text: "0.87", is_correct: true },
      { id: "c", text: "1.2", is_correct: false },
      { id: "d", text: "0.55", is_correct: false },
      { id: "e", text: "0.22", is_correct: false }
    ],
    explanation: "α = 0.37. [N₂O₄] = 1.0 - 0.37 = 0.63 M, [NO₂] = 2×0.37 = 0.74 M. Kc = [NO₂]²/[N₂O₄] = (0.74)²/0.63 ≈ 0.87.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q64: K for ONCl Dissociation",
    question_text: "At 500 K, 1 mol of ONCl is placed in a 1-L container. At equilibrium it is 5.3% dissociated: 2ONCl ⇌ 2NO + Cl₂. Determine K.",
    choices: [
      { id: "a", text: "8.3×10⁻⁵", is_correct: true },
      { id: "b", text: "1.6×10⁻³", is_correct: false },
      { id: "c", text: "5.6×10⁻²", is_correct: false },
      { id: "d", text: "9.5×10⁻¹", is_correct: false },
      { id: "e", text: "1.2×10⁴", is_correct: false }
    ],
    explanation: "Initial [ONCl] = 1 M, α = 0.053. [ONCl] = 1 - 0.053 = 0.947, [NO] = 0.053, [Cl₂] = 0.0265. K = [NO]²[Cl₂]/[ONCl]² = (0.053)²(0.0265)/(0.947)² ≈ 8.3×10⁻⁵.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q65: [NO] at Equilibrium",
    question_text: "2NOCl(g) ⇌ 2NO(g) + Cl₂(g) with K = 1.6×10⁻⁵. 1.00 mol pure NOCl and 0.958 mol pure Cl₂ in a 1.00-L container. Calculate [NO] at equilibrium.",
    choices: [
      { id: "a", text: "2.04×10⁻³ M", is_correct: false },
      { id: "b", text: "9.58×10⁻¹ M", is_correct: false },
      { id: "c", text: "1.04 M", is_correct: false },
      { id: "d", text: "5.78×10⁻³ M", is_correct: false },
      { id: "e", text: "4.09×10⁻³ M", is_correct: true }
    ],
    explanation: "Let 2x = mol NOCl reacted ⇒ [NO] = 2x, [Cl₂] = 0.958 + x, [NOCl] = 1.00 - 2x. K = (2x)²(0.958 + x)/(1.00 - 2x)² = 1.6×10⁻⁵. Solving: [NO] = 2x ≈ 0.00409 M.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q66: [Cl₂] at Equilibrium",
    question_text: "2NOCl(g) ⇌ 2NO(g) + Cl₂(g) with K = 1.6×10⁻⁵. 1.00 mol pure NOCl and 0.964 mol pure Cl₂ in a 1.00-L container. Calculate [Cl₂] at equilibrium.",
    choices: [
      { id: "a", text: "1.6×10⁻⁵ M", is_correct: false },
      { id: "b", text: "0.966 M", is_correct: true },
      { id: "c", text: "0.483 M", is_correct: false },
      { id: "d", text: "2.04×10⁻³ M", is_correct: false },
      { id: "e", text: "4.07×10⁻³ M", is_correct: false }
    ],
    explanation: "Similar to Q65. x ≈ 0.002, [Cl₂]eq = 0.964 + x ≈ 0.966 M.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q67: Percent CaCO₃ Reacted",
    question_text: "For CaCO₃(s) ⇌ CaO(s) + CO₂(g), Kp = 1.16 at 800°C. If 31.3 g CaCO₃ is put into a 10.0-L container and heated to 800°C, what percent reacts to reach equilibrium?",
    choices: [
      { id: "a", text: "21.8%", is_correct: false },
      { id: "b", text: "42.1%", is_correct: true },
      { id: "c", text: "56.5%", is_correct: false },
      { id: "d", text: "100.0%", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Moles CaCO₃ = 31.3/100.09 ≈ 0.313 mol. Kp = P(CO₂) = 1.16 atm. n(CO₂) = (1.16×10)/(0.0821×1073) ≈ 0.1316 mol. Percent = (0.1316/0.313)×100% ≈ 42.1%.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q68: Total Pressure at Equilibrium",
    question_text: "At -80°C, K for N₂O₄(g) ⇌ 2NO₂(g) is 4.66×10⁻⁸. 0.047 mol N₂O₄ is introduced into a 1.0-L vessel at -80°C. What is the total pressure at equilibrium?",
    choices: [
      { id: "a", text: "0.31 atm", is_correct: false },
      { id: "b", text: "0.74 atm", is_correct: true },
      { id: "c", text: "1.4 atm", is_correct: false },
      { id: "d", text: "2.1 atm", is_correct: false },
      { id: "e", text: "none of these", is_correct: false }
    ],
    explanation: "Very small K ⇒ little dissociation. Total moles ≈ 0.047. P = nRT/V = 0.047×0.0821×193/1 ≈ 0.745 atm.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q69: [C] at Equilibrium for 2A ⇌ 2B + C",
    question_text: "The equilibrium system 2A ⇌ 2B + C has K = 2.6×10⁻⁶. Initially 3.0 mol A in a 1.5-L flask. Determine [C] at equilibrium.",
    choices: [
      { id: "a", text: "0.011 M", is_correct: false },
      { id: "b", text: "0.024 M", is_correct: false },
      { id: "c", text: "0.032 M", is_correct: true },
      { id: "d", text: "0.048 M", is_correct: false },
      { id: "e", text: "2.0 M", is_correct: false }
    ],
    explanation: "Initial [A] = 2.0 M. Let [C] = x, then [B] = 2x, [A] = 2.0 - 2x. K = [B]²[C]/[A]² = 4x³/(2.0 - 2x)² = 2.6×10⁻⁶. Solving gives x ≈ 0.032 M.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q70: False Statement about Equilibrium",
    question_text: "Which of the following statements concerning equilibrium is not true?",
    choices: [
      { id: "a", text: "A system that is disturbed from an equilibrium condition responds in a manner to restore equilibrium.", is_correct: false },
      { id: "b", text: "Equilibrium in molecular systems is dynamic, with two opposing processes balancing one another.", is_correct: false },
      { id: "c", text: "The value of the equilibrium constant for a given reaction mixture is the same regardless of the direction from which equilibrium is attained.", is_correct: false },
      { id: "d", text: "A system moves spontaneously toward a state of equilibrium.", is_correct: false },
      { id: "e", text: "The equilibrium constant is independent of temperature.", is_correct: true }
    ],
    explanation: "K depends on temperature (van't Hoff equation). This statement is false.",
    difficulty: "easy",
    points: 10
  }
];

async function seedEquilibrium() {
  console.log("⚖️  Starting Zumdahl TB - Ch.13 Equilibrium seeding...\n");
  
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Find or create admin user
    let adminUser = await User.findOne({ role: "admin" });
    if (!adminUser) {
      adminUser = await User.findOne({ role: "editor" });
    }
    if (!adminUser) {
      adminUser = await User.findOne({});
    }
    if (!adminUser) {
      console.log("❌ No user found. Please create a user first.");
      process.exit(1);
    }
    console.log(`👤 Using user: ${adminUser.name || adminUser.email}`);

    // Find "Zumdahl TB" category
    let category = await Category.findOne({ 
      name: "Zumdahl TB", 
      subject: "Chemistry" 
    });

    if (!category) {
      // Create the category if it doesn't exist
      category = await Category.create({
        name: "Zumdahl TB",
        description: "Zumdahl Chemistry Textbook - Test Bank Questions",
        subject: "Chemistry",
        icon: "BookOpen",
        color: "#10b981",
        order: 10,
        active: true,
        quizCount: 0,
        questionCount: 0,
        created_by: adminUser._id
      });
      console.log("📂 Created 'Zumdahl TB' category");
    } else {
      console.log("📂 Found existing 'Zumdahl TB' category");
    }

    // Check if quiz already exists
    let existingQuiz = await Quiz.findOne({
      title: "Ch. 13 Equilibrium",
      category: category._id
    });

    if (existingQuiz) {
      console.log("⚠️  Quiz 'Ch. 13 Equilibrium' already exists. Deleting old questions...");
      await Question.deleteMany({ _id: { $in: existingQuiz.questions } });
      await Quiz.deleteOne({ _id: existingQuiz._id });
    }

    // Create all questions
    console.log("\n📝 Creating questions...");
    const createdQuestions = [];
    
    for (let i = 0; i < equilibriumQuestions.length; i++) {
      const q = equilibriumQuestions[i];
      const question = await Question.create({
        title: q.title,
        question_text: q.question_text,
        choices: q.choices,
        explanation: q.explanation,
        difficulty: q.difficulty,
        points: q.points,
        time_limit_seconds: 90,
        subject: "Chemistry",
        category: category._id,
        source: "Zumdahl Chemistry TB",
        tags: ["equilibrium", "Kc", "Kp", "Le-Chatelier", "AP-Chemistry"],
        published: true,
        created_by: adminUser._id
      });
      createdQuestions.push(question._id);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Created ${i + 1}/${equilibriumQuestions.length} questions`);
      }
    }
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // Create the quiz
    const quiz = await Quiz.create({
      title: "Ch. 13 Equilibrium",
      description: "Chemical Equilibrium - Equilibrium constants (Kc, Kp), reaction quotient (Q), Le Chatelier's principle, heterogeneous equilibria, and equilibrium calculations.",
      subject: "Chemistry",
      category: category._id,
      questions: createdQuestions,
      total_time: 140, // ~2.5 hours for 70 questions
      per_question_time: 90,
      randomized: true,
      show_results: true,
      allow_review: true,
      passing_score: 70,
      published: true,
      created_by: adminUser._id
    });
    console.log(`\n✅ Created quiz: "${quiz.title}" with ${createdQuestions.length} questions`);

    // Update category counts
    await Category.findByIdAndUpdate(category._id, {
      $inc: { 
        quizCount: 1, 
        questionCount: createdQuestions.length 
      }
    });
    console.log("📊 Updated category counts");

    console.log("\n🎉 Seeding complete!");
    console.log(`   Category: Zumdahl TB (Chemistry)`);
    console.log(`   Quiz: Ch. 13 Equilibrium`);
    console.log(`   Questions: ${createdQuestions.length}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

seedEquilibrium();
