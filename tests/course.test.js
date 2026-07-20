const test = require('node:test');
const assert = require('node:assert/strict');

const {
  COURSE,
  TEST_PASSING_PERCENT,
  evaluateAnswers,
  isLessonUnlocked,
  validatePractice,
} = require('../assets/course-data.js');

test('course contains a complete, ordered 30-lesson path', () => {
  assert.equal(COURSE.length, 30);
  assert.deepEqual(COURSE.map((lesson) => lesson.id), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.equal(COURSE.filter((lesson) => lesson.block === 1).length, 14);
  assert.equal(COURSE.filter((lesson) => lesson.block === 2).length, 16);
  for (const lesson of COURSE) {
    assert.ok(lesson.title);
    assert.equal(lesson.quiz.length, 3);
    assert.ok(lesson.practice.length >= 1);
  }
});

test('quiz evaluation requires at least 70 percent', () => {
  const questions = [
    { correct: 0 }, { correct: 1 }, { correct: 2 }, { correct: 0 }, { correct: 1 },
  ];
  assert.equal(TEST_PASSING_PERCENT, 70);
  assert.deepEqual(evaluateAnswers(questions, [0, 1, 2, 1, 1]), { correct: 4, percent: 80, passed: true });
  assert.deepEqual(evaluateAnswers(questions, [0, 1, 1, 1, 1]), { correct: 3, percent: 60, passed: false });
});

test('only the first and sequentially next lessons unlock', () => {
  assert.equal(isLessonUnlocked(1, []), true);
  assert.equal(isLessonUnlocked(2, []), false);
  assert.equal(isLessonUnlocked(2, [1]), true);
  assert.equal(isLessonUnlocked(4, [1, 2]), false);
  assert.equal(isLessonUnlocked(4, [1, 2, 3]), true);
});

test('practice validator reports matching output and required code snippets', () => {
  const task = { expectedOutput: '42', required: ['print', 'answer'] };
  assert.deepEqual(validatePractice(task, 'answer = 42\nprint(answer)', '42\n'), { passed: true, reason: '' });
  assert.equal(validatePractice(task, 'print(42)', '42').passed, false);
  assert.equal(validatePractice(task, 'answer = 42\nprint(answer)', '41').passed, false);
});
