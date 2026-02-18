
import { describe, it, expect } from 'vitest';
import { mentalMathQuestions } from '../data/maths/mentalMathQuestions';
import { dictees } from '../data/dictees';
import problemsData from '../data/maths/problems150.json';

describe('Integrity Checks', () => {

    describe('Calcul Rapide (Mental Math)', () => {
        it('should have unique IDs', () => {
            const ids = mentalMathQuestions.map(q => q.id);
            const uniqueIds = new Set(ids);
            const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
            expect(duplicates, `Duplicate IDs found: ${duplicates.join(', ')}`).toEqual([]);
            expect(ids.length).toBe(uniqueIds.size);
        });

        it('should not have duplicate questions', () => {
            const questions = mentalMathQuestions.map(q => q.question);
            // We might have same questions for different IDs if they are just variations, but let's check.
            // Actually, identical question text usually means a copy-paste error.
            const duplicates = questions.filter((item, index) => questions.indexOf(item) !== index);
            // Using a Set to dedup the report
            const uniqueDuplicates = [...new Set(duplicates)];
            if (uniqueDuplicates.length > 0) {
                console.warn(`Duplicate Mental Math questions found: ${uniqueDuplicates.join(' | ')}`);
            }
            // Strict check might fail if duplicates are intended (unlikely for exact same text), so warn for now or expect empty.
            // Let's expect empty to force us to review them.
            expect(uniqueDuplicates).toEqual([]);
        });

        it('should have valid answers (numbers)', () => {
            mentalMathQuestions.forEach(q => {
                expect(typeof q.answer).toBe('number');
                expect(Number.isFinite(q.answer)).toBe(true);
            });
        });
    });

    describe('Problèmes (Math Problems)', () => {
        // problemsData is an array of questions.
        it('should have unique IDs', () => {
            const ids = problemsData.map((p: any) => p.id);
            const duplicates = ids.filter((item: any, index: number) => ids.indexOf(item) !== index);
            expect(duplicates, `Duplicate IDs found in Problems: ${duplicates.join(', ')}`).toEqual([]);
        });

        it('should have correctly formatted questions', () => {
            problemsData.forEach((p: any) => {
                expect(p.questions).toBeDefined();
                expect(Array.isArray(p.questions)).toBe(true);
                p.questions.forEach((q: any, i: number) => {
                    expect(q.response, `Problem ${p.id} question ${i} missing response`).toBeDefined();
                    // Ensure response is not empty string, unless strictly intended (unlikely for a math problem answer)
                    // expect(q.response).not.toBe(""); // Some might be empty if WIP, we want to catch them.
                });
            });
        });

        it('should not have empty answers where expected', () => {
            const emptyAnswers = problemsData.filter((p: any) =>
                p.questions.some((q: any) => !q.response || q.response.trim() === "")
            );
            const report = emptyAnswers.map((p: any) => `ID ${p.id} (${p.title})`);
            expect(report, `Problems with missing sub-question answers: ${report.join(', ')}`).toEqual([]);
        });
    });

    describe('Orthographe (Dictées)', () => {
        it('should have unique IDs', () => {
            const ids = dictees.map(d => d.id);
            const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
            expect(duplicates, `Duplicate IDs found in Dictées: ${duplicates.join(', ')}`).toEqual([]);
        });

        it('should not have malformed author fields', () => {
            // Check for authors that look like they contain garbage or part of the text
            // A very long author name is suspicious.
            const suspiciousAuthors = dictees.filter(d => d.auteur && d.auteur.length > 50);
            const report = suspiciousAuthors.map(d => `ID ${d.id}: ${d.auteur}`);
            expect(report, `Suspicious author names (possible parse error): ${report.join(', ')}`).toEqual([]);
        });

        it('should not have authors containing "passé" or other non-name keywords if suspicious', () => {
            // Specific check for the issue seen in file view: "passé. George C. Franklin"
            const badAuthors = dictees.filter(d => d.auteur && d.auteur.includes('passé'));
            const report = badAuthors.map(d => `ID ${d.id}: ${d.auteur}`);
            expect(report, `Authors containing 'passé' (lines merged?): ${report.join(', ')}`).toEqual([]);
        });
    });

});
