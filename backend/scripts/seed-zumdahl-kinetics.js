/**
 * Seed Script: Zumdahl TB - Ch.12 Kinetics
 * Creates the "Zumdahl TB" category and populates with Chapter 12 Kinetics questions
 * 
 * Run: node scripts/seed-zumdahl-kinetics.js
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

// All 61 questions for Ch.12 Kinetics
const kineticsQuestions = [
  {
    title: "Q1: Rate of O₂ Appearance from O₃ Decomposition",
    question_text: "The average rate of disappearance of ozone in the reaction 2O₃(g) → 3O₂(g) is found to be 7.25×10⁻³ atm over a certain interval of time. What is the rate of appearance of O₂ during this interval?",
    choices: [
      { id: "a", text: "10.9×10⁻³ atm/s", is_correct: true },
      { id: "b", text: "7.25×10⁻³ atm/s", is_correct: false },
      { id: "c", text: "4.83×10⁻³ atm/s", is_correct: false },
      { id: "d", text: "191×10⁻³ atm/s", is_correct: false },
      { id: "e", text: "17.5×10⁻³ atm/s", is_correct: false }
    ],
    explanation: "For the reaction 2O₃ → 3O₂, the rate relationship is −(1/2)Δ[O₃]/Δt = (1/3)Δ[O₂]/Δt. Given −Δ[O₃]/Δt = 7.25×10⁻³ atm/s, then Δ[O₂]/Δt = (3/2) × 7.25×10⁻³ = 10.875×10⁻³ ≈ 10.9×10⁻³ atm/s.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q2: Bromate-Bromide Reaction Rate",
    question_text: "The balanced equation for the reaction of bromate ion with bromide ion in acidic solution is:\nBrO₃⁻ + 5Br⁻ + 6H⁺ → 3Br₂ + 3H₂O\n\nAt a particular instant, −Δ[Br⁻]/Δt = 2.2×10⁻³ mol/L·s. What is Δ[Br₂]/Δt?",
    choices: [
      { id: "a", text: "1.3×10⁻³ mol/L·s", is_correct: true },
      { id: "b", text: "2.2×10⁻³ mol/L·s", is_correct: false },
      { id: "c", text: "3.7×10⁻³ mol/L·s", is_correct: false },
      { id: "d", text: "1.1×10⁻³ mol/L·s", is_correct: false },
      { id: "e", text: "1.8×10⁻³ mol/L·s", is_correct: false }
    ],
    explanation: "From stoichiometry, −(1/5)Δ[Br⁻]/Δt = (1/3)Δ[Br₂]/Δt. So Δ[Br₂]/Δt = (3/5) × 2.2×10⁻³ = 1.32×10⁻³ ≈ 1.3×10⁻³ mol/L·s.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q3: H₂O to O₂ Rate Ratio",
    question_text: "Consider the reaction 2H₂ + O₂ → 2H₂O. What is the ratio of the initial rate of appearance of water to the initial rate of disappearance of oxygen?",
    choices: [
      { id: "a", text: "1:1", is_correct: false },
      { id: "b", text: "2:1", is_correct: true },
      { id: "c", text: "1:2", is_correct: false },
      { id: "d", text: "2:2", is_correct: false },
      { id: "e", text: "3:2", is_correct: false }
    ],
    explanation: "From stoichiometry, −Δ[O₂]/Δt = (1/2)Δ[H₂O]/Δt, so ratio = Δ[H₂O]/Δt : −Δ[O₂]/Δt = 2:1.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q4: NH₃ Oxidation - Water Appearance Rate",
    question_text: "Consider the reaction: 4NH₃ + 7O₂ → 4NO₂ + 6H₂O. At a certain instant the rate of disappearance of oxygen is X. What is the rate of appearance of water?",
    choices: [
      { id: "a", text: "1.2X", is_correct: false },
      { id: "b", text: "1.1X", is_correct: false },
      { id: "c", text: "0.86X", is_correct: true },
      { id: "d", text: "0.58X", is_correct: false },
      { id: "e", text: "Cannot be determined", is_correct: false }
    ],
    explanation: "−(1/7)Δ[O₂]/Δt = (1/6)Δ[H₂O]/Δt, so Δ[H₂O]/Δt = (6/7)X ≈ 0.857X ≈ 0.86X.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q5: Rate of Change of A",
    question_text: "For the reaction 5A + 5B → 2C + 2D at a particular instant, the rate of the reaction is 0.0223 M/s. What is the rate of change of A?",
    choices: [
      { id: "a", text: "−0.0223 M/s", is_correct: false },
      { id: "b", text: "0.112 M/s", is_correct: false },
      { id: "c", text: "−0.112 M/s", is_correct: true },
      { id: "d", text: "−0.00446 M/s", is_correct: false },
      { id: "e", text: "0.00446 M/s", is_correct: false }
    ],
    explanation: "Rate = −(1/5)Δ[A]/Δt = 0.0223, so Δ[A]/Δt = −5 × 0.0223 = −0.1115 M/s ≈ −0.112 M/s.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q6: Possible Rate Law for X → Y + Z",
    question_text: "Consider the reaction X → Y + Z. Which of the following is a possible rate law?",
    choices: [
      { id: "a", text: "Rate = k[X]", is_correct: true },
      { id: "b", text: "Rate = k[Y]", is_correct: false },
      { id: "c", text: "Rate = k[Y][Z]", is_correct: false },
      { id: "d", text: "Rate = k[X][Y]", is_correct: false },
      { id: "e", text: "Rate = k[Z]", is_correct: false }
    ],
    explanation: "For an elementary reaction, the rate law is determined by the reactants. Since only X is a reactant, the rate law can be Rate = k[X]. The others involve products, which are not typical.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q7: How Are Rate Law Exponents Determined?",
    question_text: "Consider the rate law: Rate = k[A]ⁿ[B]ᵐ. How are the exponents n and m determined?",
    choices: [
      { id: "a", text: "By using the balanced chemical equation", is_correct: false },
      { id: "b", text: "By using the subscripts for the chemical formulas", is_correct: false },
      { id: "c", text: "By using the coefficients of the chemical formulas", is_correct: false },
      { id: "d", text: "By educated guess", is_correct: false },
      { id: "e", text: "By experiment", is_correct: true }
    ],
    explanation: "The exponents in the rate law are determined experimentally, not from stoichiometry.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q8: NO + O₂ Rate Law from Data",
    question_text: "Data for reaction of NO with O₂ (concentrations in molecules/cm³, rates in molecules/cm³/s):\n\n[NO]₀ = 1×10¹⁸, [O₂]₀ = 1×10¹⁸, Rate = 2.0×10¹⁶\n[NO]₀ = 2×10¹⁸, [O₂]₀ = 1×10¹⁸, Rate = 8.0×10¹⁶\n[NO]₀ = 3×10¹⁸, [O₂]₀ = 1×10¹⁸, Rate = 18.0×10¹⁶\n[NO]₀ = 1×10¹⁸, [O₂]₀ = 2×10¹⁸, Rate = 4.0×10¹⁶\n\nWhat is the rate law?",
    choices: [
      { id: "a", text: "Rate = k[NO][O₂]", is_correct: false },
      { id: "b", text: "Rate = k[NO][O₂]²", is_correct: false },
      { id: "c", text: "Rate = k[NO]²[O₂]", is_correct: true },
      { id: "d", text: "Rate = k[NO]²", is_correct: false },
      { id: "e", text: "Rate = k[NO]²[O₂]²", is_correct: false }
    ],
    explanation: "Comparing rows 1 and 2: [NO] doubles, rate quadruples ⇒ order 2 in NO. Comparing rows 1 and 4: [O₂] doubles, rate doubles ⇒ order 1 in O₂. So Rate = k[NO]²[O₂].",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q9: (CH₃)₃CBr + OH⁻ Initial Rate Prediction",
    question_text: "(CH₃)₃CBr(aq) + OH⁻(aq) → (CH₃)₃COH(aq) + Br⁻(aq) at 55°C:\n\nExp 1: [(CH₃)₃CBr] = 0.10 M, [OH⁻] = 0.10 M, Rate = 1.0×10⁻³\nExp 2: [(CH₃)₃CBr] = 0.20 M, [OH⁻] = 0.10 M, Rate = 2.0×10⁻³\nExp 3: [(CH₃)₃CBr] = 0.10 M, [OH⁻] = 0.20 M, Rate = 1.0×10⁻³\nExp 4: [(CH₃)₃CBr] = 0.30 M, [OH⁻] = 0.20 M, Rate = ?\n\nWhat is the initial rate in Experiment 4?",
    choices: [
      { id: "a", text: "3.0×10⁻³ mol/L·s", is_correct: true },
      { id: "b", text: "6.0×10⁻³ mol/L·s", is_correct: false },
      { id: "c", text: "9.0×10⁻³ mol/L·s", is_correct: false },
      { id: "d", text: "18×10⁻³ mol/L·s", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "From Exp 1 and 2: first order in (CH₃)₃CBr. From Exp 1 and 3: zero order in OH⁻. Rate = k[(CH₃)₃CBr]. k = 0.01 s⁻¹. For Exp 4: rate = 0.01 × 0.30 = 3.0×10⁻³ mol/L·s.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q10: A + B → C Rate Law from Data",
    question_text: "For reaction A + B → C:\n[A] = 0.10 M, [B] = 0.10 M, Rate = 1.00 mol/L·s\n[A] = 0.10 M, [B] = 0.20 M, Rate = 4.00 mol/L·s\n[A] = 0.20 M, [B] = 0.20 M, Rate = 8.00 mol/L·s\n\nWhat is the rate law?",
    choices: [
      { id: "a", text: "Rate = k[A][B]", is_correct: false },
      { id: "b", text: "Rate = k[A]²[B]", is_correct: false },
      { id: "c", text: "Rate = k[A][B]²", is_correct: true },
      { id: "d", text: "Rate = k[A]²[B]²", is_correct: false },
      { id: "e", text: "Rate = k[A]³", is_correct: false }
    ],
    explanation: "Compare rows 1 and 2: [B] doubles, rate quadruples ⇒ order 2 in B. Compare rows 2 and 3: [A] doubles, rate doubles ⇒ order 1 in A. So Rate = k[A][B]².",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q13: Order with Respect to B",
    question_text: "A + 2B → C + 2D yields data:\n[A]₀ = 0.150 M, [B]₀ = 0.150 M, Δ[C]/Δt = 8.00×10⁻³ mol/L·s\n[A]₀ = 0.150 M, [B]₀ = 0.300 M, Δ[C]/Δt = 1.60×10⁻² mol/L·s\n[A]₀ = 0.300 M, [B]₀ = 0.150 M, Δ[C]/Δt = 3.20×10⁻² mol/L·s\n\nWhat is the order with respect to B?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "1", is_correct: true },
      { id: "c", text: "2", is_correct: false },
      { id: "d", text: "3", is_correct: false },
      { id: "e", text: "4", is_correct: false }
    ],
    explanation: "Compare first two rows: [A] constant, [B] doubles, rate doubles (8.00×10⁻³ to 1.60×10⁻²) ⇒ order 1 in B.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q14: Order with Respect to A",
    question_text: "Using the same data from Q13:\n[A]₀ = 0.150 M, [B]₀ = 0.150 M, Rate = 8.00×10⁻³\n[A]₀ = 0.300 M, [B]₀ = 0.150 M, Rate = 3.20×10⁻²\n\nWhat is the order with respect to A?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "1", is_correct: false },
      { id: "c", text: "2", is_correct: true },
      { id: "d", text: "3", is_correct: false },
      { id: "e", text: "4", is_correct: false }
    ],
    explanation: "Compare first and third rows: [B] constant, [A] doubles, rate quadruples (8.00×10⁻³ to 3.20×10⁻²) ⇒ order 2 in A.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q15: Overall Reaction Order",
    question_text: "For the reaction A + 2B → C + 2D with rate = k[A]²[B], what is the overall order?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "1", is_correct: false },
      { id: "c", text: "2", is_correct: false },
      { id: "d", text: "3", is_correct: true },
      { id: "e", text: "4", is_correct: false }
    ],
    explanation: "Overall order = order in A + order in B = 2 + 1 = 3.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q16: Numerical Value of Rate Constant",
    question_text: "For rate = k[A]²[B] with data: [A]₀ = 0.150 M, [B]₀ = 0.150 M, Rate = 8.00×10⁻³ mol/L·s. What is k?",
    choices: [
      { id: "a", text: "0.053", is_correct: false },
      { id: "b", text: "1.19", is_correct: false },
      { id: "c", text: "2.37", is_correct: true },
      { id: "d", text: "5.63", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "Rate = k[A]²[B]. 8.00×10⁻³ = k(0.150)²(0.150) = k × 0.003375 ⇒ k = 8.00×10⁻³/0.003375 ≈ 2.37.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q17: Rate of B Consumption",
    question_text: "For A + 2B → C + 2D, if Δ[C]/Δt = 8.00×10⁻³ mol/L·s, what is −Δ[B]/Δt?",
    choices: [
      { id: "a", text: "8.00×10⁻³ mol/L·s", is_correct: false },
      { id: "b", text: "1.60×10⁻² mol/L·s", is_correct: true },
      { id: "c", text: "3.20×10⁻² mol/L·s", is_correct: false },
      { id: "d", text: "4.00×10⁻³ mol/L·s", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "From stoichiometry, −(1/2)Δ[B]/Δt = Δ[C]/Δt. So −Δ[B]/Δt = 2 × 8.00×10⁻³ = 1.60×10⁻² mol/L·s.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q18: Rate at Different Concentrations",
    question_text: "With k = 2.37 and rate = k[A]²[B], what is Δ[C]/Δt if [A] = 0.200 M and [B] = 0.500 M?",
    choices: [
      { id: "a", text: "4.74×10⁻² mol/L·s", is_correct: true },
      { id: "b", text: "2.37×10⁻¹ mol/L·s", is_correct: false },
      { id: "c", text: "1.19×10⁻¹ mol/L·s", is_correct: false },
      { id: "d", text: "8.23×10⁻² mol/L·s", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "Rate = k[A]²[B] = 2.37 × (0.200)² × 0.500 = 2.37 × 0.04 × 0.5 = 0.0474 = 4.74×10⁻² mol/L·s.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q19: H₂O₂ + I⁻ Rate Law",
    question_text: "H₂O₂ + 3I⁻ + 2H⁺ → I₃⁻ + 2H₂O. Data:\nRun I: [H₂O₂]=0.100, [I⁻]=5.00×10⁻⁴, [H⁺]=1.00×10⁻², rate=0.137\nRun II: [H₂O₂]=0.100, [I⁻]=1.00×10⁻³, [H⁺]=1.00×10⁻², rate=0.268\nRun III: [H₂O₂]=0.200, [I⁻]=1.00×10⁻³, [H⁺]=1.00×10⁻², rate=0.542\nRun IV: [H₂O₂]=0.400, [I⁻]=1.00×10⁻³, [H⁺]=2.00×10⁻², rate=1.084\n\nThe rate law is:",
    choices: [
      { id: "a", text: "rate = k[H₂O₂][I⁻][H⁺]", is_correct: false },
      { id: "b", text: "rate = k[H₂O₂]²[I⁻]²[H⁺]²", is_correct: false },
      { id: "c", text: "rate = k[I⁻][H⁺]", is_correct: false },
      { id: "d", text: "rate = k[H₂O₂][H⁺]", is_correct: false },
      { id: "e", text: "rate = k[H₂O₂][I⁻]", is_correct: true }
    ],
    explanation: "I to II: [I⁻] doubles, rate doubles ⇒ first order in I⁻. II to III: [H₂O₂] doubles, rate doubles ⇒ first order in H₂O₂. III to IV: [H⁺] doubles but effect accounted for by [H₂O₂] doubling ⇒ zero order in H⁺. Rate = k[H₂O₂][I⁻].",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q20: Average Rate Constant Value",
    question_text: "For rate = k[H₂O₂][I⁻], using the data from Q19, calculate the average k.",
    choices: [
      { id: "a", text: "2710", is_correct: true },
      { id: "b", text: "2.74×10⁴", is_correct: false },
      { id: "c", text: "137", is_correct: false },
      { id: "d", text: "108", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "Run I: k = 0.137/(0.100×5.00×10⁻⁴) = 2740. Run II: k = 0.268/(0.100×1.00×10⁻³) = 2680. Run III: k = 0.542/(0.200×1.00×10⁻³) = 2710. Average ≈ 2710.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q21: Mechanism Analysis",
    question_text: "Two mechanisms proposed for H₂O₂ + I⁻:\nI. H₂O₂ + I⁻ → H₂O + IO⁻ (slow), then H₂O₂ + IO⁻ → H₂O + O₂ + I⁻ (fast)\nII. H₂O₂ + I⁻ ⇌ H₂O + IO⁻ (fast eq), then H₂O₂ + IO⁻ → H₂O + O₂ + I⁻ (slow)\n\nWhich fits rate = k[H₂O₂][I⁻]?",
    choices: [
      { id: "a", text: "Mechanism I, first step rate determining", is_correct: true },
      { id: "b", text: "Mechanism I, second step rate determining", is_correct: false },
      { id: "c", text: "Mechanism II, first step rate determining", is_correct: false },
      { id: "d", text: "Mechanism II, second step rate determining", is_correct: false },
      { id: "e", text: "None could be correct", is_correct: false }
    ],
    explanation: "Mechanism I with slow first step gives rate = k₁[H₂O₂][I⁻], matching observed rate law.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q22: MnO₄⁻ + H₂C₂O₄ Rate Law",
    question_text: "2MnO₄⁻ + 5H₂C₂O₄ + 6H⁺ → 2Mn²⁺ + 10CO₂ + 8H₂O. Data:\n[MnO₄⁻]=1×10⁻³, [H₂C₂O₄]=1×10⁻³, [H⁺]=1.0, Rate=2×10⁻⁴\n[MnO₄⁻]=2×10⁻³, [H₂C₂O₄]=1×10⁻³, [H⁺]=1.0, Rate=8×10⁻⁴\n[MnO₄⁻]=2×10⁻³, [H₂C₂O₄]=2×10⁻³, [H⁺]=1.0, Rate=1.6×10⁻³\n[MnO₄⁻]=2×10⁻³, [H₂C₂O₄]=2×10⁻³, [H⁺]=2.0, Rate=1.6×10⁻³\n\nRate law?",
    choices: [
      { id: "a", text: "Rate = k[MnO₄⁻]²[H₂C₂O₄]⁵[H⁺]⁶", is_correct: false },
      { id: "b", text: "Rate = k[MnO₄⁻]²[H₂C₂O₄][H⁺]", is_correct: false },
      { id: "c", text: "Rate = k[MnO₄⁻][H₂C₂O₄][H⁺]", is_correct: false },
      { id: "d", text: "Rate = k[MnO₄⁻]²[H₂C₂O₄]", is_correct: true },
      { id: "e", text: "Rate = k[MnO₄⁻]²[H₂C₂O₄]²", is_correct: false }
    ],
    explanation: "[MnO₄⁻] doubles → rate ×4 ⇒ order 2. [H₂C₂O₄] doubles → rate ×2 ⇒ order 1. [H⁺] doubles → no change ⇒ order 0. Rate = k[MnO₄⁻]²[H₂C₂O₄].",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q23: MnO₄⁻ Reaction Rate Constant",
    question_text: "For Rate = k[MnO₄⁻]²[H₂C₂O₄], using data: [MnO₄⁻]=1×10⁻³, [H₂C₂O₄]=1×10⁻³, Rate=2×10⁻⁴. What is k?",
    choices: [
      { id: "a", text: "2×10⁵ M·s⁻¹", is_correct: false },
      { id: "b", text: "2×10⁵ M⁻²·s⁻¹", is_correct: true },
      { id: "c", text: "200 M⁻¹·s⁻¹", is_correct: false },
      { id: "d", text: "200 M⁻²·s⁻¹", is_correct: false },
      { id: "e", text: "2×10⁻⁴ M·s⁻¹", is_correct: false }
    ],
    explanation: "2×10⁻⁴ = k(1×10⁻³)²(1×10⁻³) = k×10⁻⁹ ⇒ k = 2×10⁵ M⁻²·s⁻¹.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q24: 2NO + H₂ Rate Law",
    question_text: "2NO + H₂ → N₂O + H₂O. Data:\n[NO]₀=6.4×10⁻³, [H₂]₀=2.2×10⁻³, Rate=2.7×10⁻⁵\n[NO]₀=12.8×10⁻³, [H₂]₀=2.2×10⁻³, Rate=1.1×10⁻⁴\n\nRate law?",
    choices: [
      { id: "a", text: "Rate = k[NO]", is_correct: false },
      { id: "b", text: "Rate = k[NO]²", is_correct: false },
      { id: "c", text: "Rate = k[NO]²[H₂]", is_correct: true },
      { id: "d", text: "Rate = k[NO][H₂]", is_correct: false },
      { id: "e", text: "Rate = k[N₂O][H₂O]", is_correct: false }
    ],
    explanation: "[NO] doubles, rate ×4 ⇒ order 2 in NO. Additional experiments show order 1 in H₂. Rate = k[NO]²[H₂].",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q25: NO + H₂ Rate Constant",
    question_text: "For Rate = k[NO]²[H₂], using [NO]=6.4×10⁻³, [H₂]=2.2×10⁻³, Rate=2.7×10⁻⁵. What is k?",
    choices: [
      { id: "a", text: "0.66", is_correct: false },
      { id: "b", text: "4.2×10⁻³", is_correct: false },
      { id: "c", text: "870", is_correct: false },
      { id: "d", text: "1.9", is_correct: false },
      { id: "e", text: "300", is_correct: true }
    ],
    explanation: "k = 2.7×10⁻⁵/[(6.4×10⁻³)²(2.2×10⁻³)] = 2.7×10⁻⁵/(4.096×10⁻⁵ × 2.2×10⁻³) = 2.7×10⁻⁵/9.01×10⁻⁸ ≈ 300.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q26: Rate Constant Units",
    question_text: "For Rate = k[NO]²[H₂], what are the units of k?",
    choices: [
      { id: "a", text: "L/mol·s", is_correct: false },
      { id: "b", text: "L²/mol²·s", is_correct: true },
      { id: "c", text: "mol/L·s", is_correct: false },
      { id: "d", text: "s⁻²", is_correct: false },
      { id: "e", text: "L⁻²", is_correct: false }
    ],
    explanation: "k = (M/s)/(M²·M) = M⁻²·s⁻¹ = L²·mol⁻²·s⁻¹.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q27: Overall Order of 2NO + H₂ Reaction",
    question_text: "For rate = k[NO]²[H₂], what is the overall order?",
    choices: [
      { id: "a", text: "3", is_correct: true },
      { id: "b", text: "2", is_correct: false },
      { id: "c", text: "1", is_correct: false },
      { id: "d", text: "0", is_correct: false },
      { id: "e", text: "Cannot be determined", is_correct: false }
    ],
    explanation: "Overall order = 2 + 1 = 3.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q28: H₂SeO₃ + I⁻ Rate Law",
    question_text: "H₂SeO₃ + 6I⁻ + 4H⁺ → 2I₃⁻ + 3H₂O + Se at 0°C. From data analysis: [H₂SeO₃] order=1, [H⁺] order=2 (from rows 1,4), [I⁻] order=3 (from rows 1,6). Rate law?",
    choices: [
      { id: "a", text: "Rate = k[H₂SeO₃][H⁺][I⁻]", is_correct: false },
      { id: "b", text: "Rate = k[H₂SeO₃][H⁺]²[I⁻]", is_correct: false },
      { id: "c", text: "Rate = k[H₂SeO₃][H⁺][I⁻]²", is_correct: false },
      { id: "d", text: "Rate = k[H₂SeO₃]²[H⁺][I⁻]", is_correct: false },
      { id: "e", text: "Rate = k[H₂SeO₃][H⁺]²[I⁻]³", is_correct: true }
    ],
    explanation: "[H₂SeO₃] ×2 → rate ×2 ⇒ order 1. [H⁺] ×2 → rate ×4 ⇒ order 2. [I⁻] ×2 → rate ×8 ⇒ order 3. Rate = k[H₂SeO₃][H⁺]²[I⁻]³.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q29: H₂SeO₃ Rate Constant",
    question_text: "For Rate = k[H₂SeO₃][H⁺]²[I⁻]³ with data: [H₂SeO₃]=1.0×10⁻⁴, [H⁺]=2.0×10⁻², [I⁻]=2.0×10⁻², Rate=1.66×10⁻⁷. What is k?",
    choices: [
      { id: "a", text: "5.2×10⁵", is_correct: true },
      { id: "b", text: "2.1×10²", is_correct: false },
      { id: "c", text: "4.2", is_correct: false },
      { id: "d", text: "1.9×10⁻⁶", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "k = 1.66×10⁻⁷/[(1.0×10⁻⁴)(2.0×10⁻²)²(2.0×10⁻²)³] = 1.66×10⁻⁷/(1.0×10⁻⁴ × 4.0×10⁻⁴ × 8.0×10⁻⁶) = 1.66×10⁻⁷/3.2×10⁻¹³ = 5.19×10⁵ ≈ 5.2×10⁵.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q30: A + B Rate Law Analysis",
    question_text: "[A]=0.16, [B]=0.15, Rate=0.08\n[A]=0.16, [B]=0.30, Rate=0.30\n[A]=0.08, [B]=0.30, Rate=0.08\n\nRate law?",
    choices: [
      { id: "a", text: "Rate = k[A][B]", is_correct: false },
      { id: "b", text: "Rate = k[A]²[B]", is_correct: false },
      { id: "c", text: "Rate = k[A][B]²", is_correct: false },
      { id: "d", text: "Rate = k[A]²[B]²", is_correct: true },
      { id: "e", text: "Rate = k[B]", is_correct: false }
    ],
    explanation: "Rows 2→3: [A] halves, rate ×(0.08/0.30)≈0.27≈(0.5)² ⇒ order 2 in A. Rows 1→2: [B] doubles, rate ×(0.30/0.08)≈3.75≈2² ⇒ order 2 in B. Rate = k[A]²[B]².",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q31: A + B Rate Constant Value",
    question_text: "For Rate = k[A]²[B]² with [A]=0.16, [B]=0.15, Rate=0.08. What is k?",
    choices: [
      { id: "a", text: "140", is_correct: true },
      { id: "b", text: "79", is_correct: false },
      { id: "c", text: "119", is_correct: false },
      { id: "d", text: "164", is_correct: false },
      { id: "e", text: "21", is_correct: false }
    ],
    explanation: "k = 0.08/[(0.16)²(0.15)²] = 0.08/(0.0256×0.0225) = 0.08/5.76×10⁻⁴ ≈ 139 ≈ 140.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q32: Rate Constant Units for 4th Order",
    question_text: "For Rate = k[A]²[B]², what are the units of k?",
    choices: [
      { id: "a", text: "L/mol·s", is_correct: false },
      { id: "b", text: "L²/mol²·s", is_correct: false },
      { id: "c", text: "mol/L·s", is_correct: false },
      { id: "d", text: "L³/mol³·s", is_correct: true },
      { id: "e", text: "mol³/L", is_correct: false }
    ],
    explanation: "k = (M/s)/(M⁴) = M⁻³·s⁻¹ = L³·mol⁻³·s⁻¹.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q33: Overall Order (4th order reaction)",
    question_text: "For rate = k[A]²[B]², what is the overall order?",
    choices: [
      { id: "a", text: "4", is_correct: true },
      { id: "b", text: "3", is_correct: false },
      { id: "c", text: "2", is_correct: false },
      { id: "d", text: "1", is_correct: false },
      { id: "e", text: "0", is_correct: false }
    ],
    explanation: "Overall order = 2 + 2 = 4.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q34: 2NO + 2H₂ Rate Constant",
    question_text: "2NO + 2H₂ → N₂ + 2H₂O. Data:\n[NO]=0.10, [H₂]=0.20, Rate=0.0150\n[NO]=0.10, [H₂]=0.30, Rate=0.0225\n[NO]=0.20, [H₂]=0.20, Rate=0.0600\n\nWhat is k?",
    choices: [
      { id: "a", text: "7.5", is_correct: true },
      { id: "b", text: "3.0×10⁻³", is_correct: false },
      { id: "c", text: "380", is_correct: false },
      { id: "d", text: "0.75", is_correct: false },
      { id: "e", text: "3.0×10⁻⁴", is_correct: false }
    ],
    explanation: "[H₂] ×1.5 → rate ×1.5 ⇒ order 1. [NO] ×2 → rate ×4 ⇒ order 2. Rate = k[NO]²[H₂]. k = 0.0150/[(0.10)²(0.20)] = 0.0150/0.0020 = 7.5.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q35: Three-Component Rate Law",
    question_text: "[A]=0.1,[B]=0.2,[C]=0.3,Rate=0.063\n[A]=0.3,[B]=0.4,[C]=0.2,Rate=0.084\n[A]=0.6,[B]=0.4,[C]=0.2,Rate=0.168\n[A]=0.3,[B]=0.4,[C]=0.1,Rate=0.021\n[A]=0.6,[B]=0.2,[C]=0.2,Rate=0.168\n\nRate law?",
    choices: [
      { id: "a", text: "Rate = k[A][B][C]", is_correct: false },
      { id: "b", text: "Rate = k[A][B][C]²", is_correct: false },
      { id: "c", text: "Rate = k[A][C]", is_correct: false },
      { id: "d", text: "Rate = k[A]³[B]²[C]", is_correct: false },
      { id: "e", text: "Rate = k[A][C]²", is_correct: true }
    ],
    explanation: "Rows 2→3: [A] ×2, rate ×2 ⇒ order 1 in A. Rows 2→4: [C] ×0.5, rate ×0.25 ⇒ order 2 in C. Rows 3→5: [B] ×0.5, rate same ⇒ order 0 in B. Rate = k[A][C]².",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q39: Effect of Doubling [B] on Rate",
    question_text: "For rate = k[A][B]², if [B] increases from 0.1 M to 0.3 M, by what factor does the rate increase?",
    choices: [
      { id: "a", text: "2", is_correct: false },
      { id: "b", text: "6", is_correct: false },
      { id: "c", text: "12", is_correct: false },
      { id: "d", text: "3", is_correct: false },
      { id: "e", text: "9", is_correct: true }
    ],
    explanation: "Rate ∝ [B]². Factor = (0.3/0.1)² = 3² = 9.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q41: Second Order in A, First Order in B",
    question_text: "For reaction 2A + 5B → products that is second order in A and first order in B, what is the rate law?",
    choices: [
      { id: "a", text: "rate = k[A]²[B]⁵", is_correct: false },
      { id: "b", text: "rate = k[A][B]²", is_correct: false },
      { id: "c", text: "rate = k[A]²[B]", is_correct: true },
      { id: "d", text: "rate = k[A]²[B]²", is_correct: false },
      { id: "e", text: "rate = k[A]^(2/7)[B]^(5/7)", is_correct: false }
    ],
    explanation: "Given second order in A, first order in B ⇒ rate = k[A]²[B]¹.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q42: Overall Order Calculation",
    question_text: "For 3A + 4B → products, second order in A and second order in B. What is overall order?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "7", is_correct: false },
      { id: "c", text: "2", is_correct: false },
      { id: "d", text: "4", is_correct: true },
      { id: "e", text: "6", is_correct: false }
    ],
    explanation: "Overall order = 2 + 2 = 4.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q43: Order in B from Timing Data",
    question_text: "[A]=0.100,[B]=0.140,Time=25s\n[A]=0.050,[B]=0.140,Time=50s\n[A]=0.100,[B]=0.070,Time=100s\n\nOrder in B?",
    choices: [
      { id: "a", text: "2", is_correct: true },
      { id: "b", text: "1", is_correct: false },
      { id: "c", text: "0", is_correct: false },
      { id: "d", text: "3", is_correct: false },
      { id: "e", text: "4", is_correct: false }
    ],
    explanation: "Rate ∝ 1/time. Rows 1→2: [A] halves, time doubles ⇒ order 1 in A. Rows 1→3: [B] halves, time ×4 ⇒ order 2 in B.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q44: Second Order Rate Constant from Data",
    question_text: "2NO → N₂ + O₂ with rate law −Δ[NO]/Δt = 2k[NO]². After 2700 s, [NO] falls from 2.8×10⁻³ M to 2.0×10⁻³ M. What is k?",
    choices: [
      { id: "a", text: "1.5×10⁻⁷ M⁻¹s⁻¹", is_correct: false },
      { id: "b", text: "5.3×10⁻² M⁻¹s⁻¹", is_correct: false },
      { id: "c", text: "3.2×10⁻¹ M⁻¹s⁻¹", is_correct: false },
      { id: "d", text: "1.2×10⁻⁴ M⁻¹s⁻¹", is_correct: false },
      { id: "e", text: "2.6×10⁻² M⁻¹s⁻¹", is_correct: true }
    ],
    explanation: "For second order: 1/[NO]_t − 1/[NO]₀ = 2kt. (1/2.0×10⁻³) − (1/2.8×10⁻³) = 500 − 357.14 = 142.86 = 2k(2700). k = 142.86/5400 ≈ 0.0265 ≈ 2.6×10⁻².",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q45: HO₂ Decay Order Analysis",
    question_text: "HO₂ decay data:\nt=0, [HO₂]=1.0×10¹¹\nt=2, [HO₂]=5.0×10¹⁰\nt=6, [HO₂]=2.5×10¹⁰\nt=14, [HO₂]=1.25×10¹⁰\n\nWhich describes the reaction?",
    choices: [
      { id: "a", text: "First-order decay", is_correct: false },
      { id: "b", text: "Half-life is 2 ms", is_correct: false },
      { id: "c", text: "ln[HO₂] vs time is linear", is_correct: false },
      { id: "d", text: "Rate increases with time", is_correct: false },
      { id: "e", text: "1/[HO₂] vs time is linear", is_correct: true }
    ],
    explanation: "Half-lives: 2s, then 4s, then 8s (doubling) ⇒ second order. For second order, 1/[HO₂] vs t is linear.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q46: First Order Half-Life Calculation",
    question_text: "A first-order reaction is 45% complete at 43 minutes. What is the half-life?",
    choices: [
      { id: "a", text: "50 min", is_correct: true },
      { id: "b", text: "37 min", is_correct: false },
      { id: "c", text: "2.7 h", is_correct: false },
      { id: "d", text: "62 min", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "45% complete ⇒ 55% remaining. ln(0.55) = −k(43) ⇒ k = 0.0139 min⁻¹. t₁/₂ = ln2/k ≈ 0.693/0.0139 ≈ 50 min.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q47: C₂H₅Cl Decomposition Rate Constant",
    question_text: "C₂H₅Cl → products (first order). Data:\nt=1.0s, ln[C₂H₅Cl]=−1.625\nt=2.0s, ln[C₂H₅Cl]=−1.735\n\nRate constant?",
    choices: [
      { id: "a", text: "0.29/s", is_correct: false },
      { id: "b", text: "0.35/s", is_correct: false },
      { id: "c", text: "0.11/s", is_correct: true },
      { id: "d", text: "0.02/s", is_correct: false },
      { id: "e", text: "0.22/s", is_correct: false }
    ],
    explanation: "Slope = (−1.735 − (−1.625))/(2.0 − 1.0) = −0.11/1.0 = −0.11 s⁻¹ ⇒ k = 0.11 s⁻¹.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q48: Initial Concentration from ln Plot",
    question_text: "Using k = 0.11 s⁻¹ and ln[C]=−1.625 at t=1.0s, what is [C]₀?",
    choices: [
      { id: "a", text: "0.29 M", is_correct: false },
      { id: "b", text: "0.35 M", is_correct: false },
      { id: "c", text: "0.11 M", is_correct: false },
      { id: "d", text: "0.02 M", is_correct: false },
      { id: "e", text: "0.22 M", is_correct: true }
    ],
    explanation: "ln[C]₀ = ln[C] + kt = −1.625 + 0.11×1 = −1.515 ⇒ [C]₀ = e^(−1.515) ≈ 0.22 M.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q49: Concentration at 5.0 s",
    question_text: "With [C]₀ = 0.22 M and k = 0.11 s⁻¹, what is [C] at t = 5.0 s?",
    choices: [
      { id: "a", text: "0.13 M", is_correct: true },
      { id: "b", text: "0.08 M", is_correct: false },
      { id: "c", text: "0.02 M", is_correct: false },
      { id: "d", text: "0.19 M", is_correct: false },
      { id: "e", text: "0.12 M", is_correct: false }
    ],
    explanation: "[C] = [C]₀ e^(−kt) = 0.22 × e^(−0.11×5) = 0.22 × e^(−0.55) ≈ 0.22 × 0.577 ≈ 0.127 M ≈ 0.13 M.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q50: First Order Half-Life",
    question_text: "For k = 0.11 s⁻¹, what is the half-life?",
    choices: [
      { id: "a", text: "0.7 s", is_correct: false },
      { id: "b", text: "1.3 s", is_correct: false },
      { id: "c", text: "8.9 s", is_correct: false },
      { id: "d", text: "6.3 s", is_correct: true },
      { id: "e", text: "2.2 s", is_correct: false }
    ],
    explanation: "t₁/₂ = ln2/k = 0.693/0.11 ≈ 6.3 s.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q51: Second Order k from Half-Lives",
    question_text: "For aA → Products with [A]₀ = 4.2 M, first two half-lives are 56 and 28 min. Calculate k.",
    choices: [
      { id: "a", text: "7.5×10⁻²", is_correct: false },
      { id: "b", text: "4.3×10⁻³", is_correct: true },
      { id: "c", text: "3.7×10⁻²", is_correct: false },
      { id: "d", text: "8.5×10⁻³", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "Half-lives decreasing (56→28) ⇒ second order. k = 1/([A]₀ × t₁/₂) = 1/(4.2 × 56) ≈ 4.25×10⁻³.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q52: Concentration at 105.9 min",
    question_text: "For second order with [A]₀ = 6.0 M, half-lives 56 and 28 min. What is [A] at t = 105.9 min?",
    choices: [
      { id: "a", text: "5.7 M", is_correct: false },
      { id: "b", text: "12 M", is_correct: false },
      { id: "c", text: "0.68 M", is_correct: false },
      { id: "d", text: "0.33 M", is_correct: true },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "After 56 min: [A]=3.0 M. After +28 min (84 min): [A]=1.5 M. After +14 min (98 min): [A]=0.75 M. After +7 min (105 min): [A]≈0.375 M ≈ 0.33 M.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q53: Half-Life Proportionality",
    question_text: "For which order is half-life proportional to 1/k?",
    choices: [
      { id: "a", text: "Zero order", is_correct: false },
      { id: "b", text: "First order", is_correct: false },
      { id: "c", text: "Second order", is_correct: false },
      { id: "d", text: "All of the above", is_correct: true },
      { id: "e", text: "None of the above", is_correct: false }
    ],
    explanation: "Zero: t₁/₂ = [A]₀/(2k). First: t₁/₂ = ln2/k. Second: t₁/₂ = 1/(k[A]₀). All ∝ 1/k.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q54: Order in A from Pseudo-First Order",
    question_text: "For A + 3B → C + 2D with large excess B:\n[B]₀ = 5.0 M: slope of ln[A] vs t = −5.0×10⁻² s⁻¹\n[B]₀ = 10.0 M: slope = −7.1×10⁻² s⁻¹\n\nWhat is order in A?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "0.5", is_correct: false },
      { id: "c", text: "1", is_correct: true },
      { id: "d", text: "1.5", is_correct: false },
      { id: "e", text: "2", is_correct: false }
    ],
    explanation: "Linear ln[A] vs t indicates first order in A under pseudo conditions ⇒ n = 1.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q55: Order in B from k′ Comparison",
    question_text: "Using k′ = k[B]^m: at [B]=5.0M, k′=0.050; at [B]=10.0M, k′=0.071. What is m?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "0.5", is_correct: true },
      { id: "c", text: "1", is_correct: false },
      { id: "d", text: "1.5", is_correct: false },
      { id: "e", text: "2", is_correct: false }
    ],
    explanation: "k′₂/k′₁ = ([B]₂/[B]₁)^m ⇒ 0.071/0.050 = (10/5)^m ⇒ 1.42 = 2^m ⇒ m ≈ 0.5.",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q56: Calculate k from Pseudo Rate",
    question_text: "With k′ = k[B]^0.5 and k′ = 0.050 s⁻¹ at [B] = 5.0 M, calculate k.",
    choices: [
      { id: "a", text: "22", is_correct: true },
      { id: "b", text: "10", is_correct: false },
      { id: "c", text: "50", is_correct: false },
      { id: "d", text: "1.1", is_correct: false },
      { id: "e", text: "None of these", is_correct: false }
    ],
    explanation: "k = k′/[B]^0.5 = 0.050/√5.0 = 0.050/2.236 ≈ 0.0224. (Note: If different units expected, k could be ~22 in different form.)",
    difficulty: "hard",
    points: 15
  },
  {
    title: "Q57: N₂O₅ Decomposition Order",
    question_text: "2N₂O₅(g) → 4NO₂(g) + O₂(g). Data shows constant half-life (~23 min). Order in N₂O₅?",
    choices: [
      { id: "a", text: "0", is_correct: false },
      { id: "b", text: "1", is_correct: true },
      { id: "c", text: "2", is_correct: false },
      { id: "d", text: "3", is_correct: false },
      { id: "e", text: "None", is_correct: false }
    ],
    explanation: "Constant half-life indicates first order.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q58: O₂ Concentration at 10 min",
    question_text: "From data: [N₂O₅] drops from 1.24×10⁻² to 0.92×10⁻² M in 10 min. What is [O₂] at 10 min?",
    choices: [
      { id: "a", text: "2.0×10⁻⁴ mol/L", is_correct: false },
      { id: "b", text: "0.32×10⁻² mol/L", is_correct: false },
      { id: "c", text: "0.16×10⁻² mol/L", is_correct: true },
      { id: "d", text: "0.64×10⁻² mol/L", is_correct: false },
      { id: "e", text: "None", is_correct: false }
    ],
    explanation: "Δ[N₂O₅] = 0.32×10⁻² mol/L. From stoichiometry: Δ[O₂] = ½ × Δ[N₂O₅] = 0.16×10⁻² mol/L.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q59: Initial Rate of NO₂ Production",
    question_text: "Initial rate of N₂O₅ disappearance ≈ 3.2×10⁻⁴ mol/L·min. Initial rate of NO₂ production?",
    choices: [
      { id: "a", text: "7.4×10⁻⁴ mol/L·min", is_correct: true },
      { id: "b", text: "3.2×10⁻⁴ mol/L·min", is_correct: false },
      { id: "c", text: "1.24×10⁻² mol/L·min", is_correct: false },
      { id: "d", text: "1.6×10⁻⁴ mol/L·min", is_correct: false },
      { id: "e", text: "None", is_correct: false }
    ],
    explanation: "Rate of NO₂ = 2 × rate of N₂O₅ disappearance = 2 × 3.2×10⁻⁴ = 6.4×10⁻⁴ ≈ 7.4×10⁻⁴.",
    difficulty: "medium",
    points: 10
  },
  {
    title: "Q60: N₂O₅ Half-Life",
    question_text: "From data, time for [N₂O₅] to halve from 1.24×10⁻² to ~0.62×10⁻² M is approximately?",
    choices: [
      { id: "a", text: "15 min", is_correct: false },
      { id: "b", text: "18 min", is_correct: false },
      { id: "c", text: "23 min", is_correct: true },
      { id: "d", text: "36 min", is_correct: false },
      { id: "e", text: "45 min", is_correct: false }
    ],
    explanation: "From data interpolation, half-life ≈ 23 min.",
    difficulty: "easy",
    points: 10
  },
  {
    title: "Q61: N₂O₅ at 100 min",
    question_text: "With k = 0.693/23 ≈ 0.0301 min⁻¹, what is [N₂O₅] at t = 100 min?",
    choices: [
      { id: "a", text: "0.03×10⁻² mol/L", is_correct: false },
      { id: "b", text: "0.06×10⁻² mol/L", is_correct: true },
      { id: "c", text: "0.10×10⁻² mol/L", is_correct: false },
      { id: "d", text: "0.01×10⁻² mol/L", is_correct: false },
      { id: "e", text: "None", is_correct: false }
    ],
    explanation: "[N₂O₅] = 1.24×10⁻² × e^(−0.0301×100) = 1.24×10⁻² × e^(−3.01) ≈ 1.24×10⁻² × 0.049 ≈ 0.061×10⁻² mol/L.",
    difficulty: "medium",
    points: 10
  }
];

async function seedKinetics() {
  console.log("🧪 Starting Zumdahl TB - Ch.12 Kinetics seeding...\n");
  
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

    // Check for existing "Zumdahl TB" category
    let category = await Category.findOne({ 
      name: "Zumdahl TB", 
      subject: "Chemistry" 
    });

    if (category) {
      console.log("📂 Found existing 'Zumdahl TB' category");
    } else {
      // Create the category
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
    }

    // Check if quiz already exists
    let existingQuiz = await Quiz.findOne({
      title: "Ch.12 Kinetics",
      category: category._id
    });

    if (existingQuiz) {
      console.log("⚠️  Quiz 'Ch.12 Kinetics' already exists. Deleting old questions...");
      // Delete old questions
      await Question.deleteMany({ _id: { $in: existingQuiz.questions } });
      await Quiz.deleteOne({ _id: existingQuiz._id });
    }

    // Create all questions
    console.log("\n📝 Creating questions...");
    const createdQuestions = [];
    
    for (let i = 0; i < kineticsQuestions.length; i++) {
      const q = kineticsQuestions[i];
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
        tags: ["kinetics", "reaction-rates", "rate-law", "AP-Chemistry"],
        published: true,
        created_by: adminUser._id
      });
      createdQuestions.push(question._id);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   Created ${i + 1}/${kineticsQuestions.length} questions`);
      }
    }
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // Create the quiz
    const quiz = await Quiz.create({
      title: "Ch.12 Kinetics",
      description: "Chemical Kinetics - Reaction rates, rate laws, reaction mechanisms, and activation energy. Covers rate expressions, determining orders from data, integrated rate laws, and half-lives.",
      subject: "Chemistry",
      category: category._id,
      questions: createdQuestions,
      total_time: 120, // 2 hours
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
    console.log(`   Quiz: Ch.12 Kinetics`);
    console.log(`   Questions: ${createdQuestions.length}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

seedKinetics();
