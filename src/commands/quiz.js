import { getRandomTrivia, SPACE_TRIVIA_QUESTIONS } from '../services/nasaService.js';

/**
 * Handle /astro-quiz slash command
 */
export async function handleQuizCommand({ ack, respond }) {
  await ack();

  try {
    const trivia = getRandomTrivia();

    const optionButtons = trivia.options.map((opt, idx) => ({
      type: 'button',
      text: {
        type: 'plain_text',
        text: opt,
        emoji: true
      },
      action_id: `action_quiz_answer_${trivia.id}_${idx}`,
      value: JSON.stringify({ qId: trivia.id, selected: idx })
    }));

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🧠 NASA Mission Control Space Quiz!`,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Question:*\n> *${trivia.question}*`
        }
      },
      {
        type: 'actions',
        elements: optionButtons
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Click an option above to submit your telemetry answer!_`
          }
        ]
      }
    ];

    await respond({
      response_type: 'in_channel',
      blocks
    });
  } catch (error) {
    console.error('Error in handleQuizCommand:', error);
    await respond({
      response_type: 'ephemeral',
      text: `⚠️ *Quiz System Error:* ${error.message}`
    });
  }
}

/**
 * Handle quiz answer button action
 */
export async function handleQuizAnswerAction({ body, ack, respond }) {
  await ack();

  try {
    const action = body.actions[0];
    const payload = JSON.parse(action.value || '{}');
    const question = SPACE_TRIVIA_QUESTIONS.find(q => q.id === payload.qId);

    if (!question) {
      await respond({
        response_type: 'ephemeral',
        text: `⚠️ Could not find this question in Mission Control database.`
      });
      return;
    }

    const isCorrect = payload.selected === question.answerIndex;
    const chosenOption = question.options[payload.selected];
    const correctOption = question.options[question.answerIndex];
    const userName = body.user?.name || body.user?.username || 'Astronaut';

    const resultBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: isCorrect
            ? `🎉 *CORRECT, <@${body.user?.id}>!* 🚀\nYou chose *${chosenOption}* which is right on target!`
            : `❌ *INCORRECT, <@${body.user?.id}>!*\nYou chose *${chosenOption}*, but the correct answer was *${correctOption}*.`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `💡 *Mission Debrief:*\n${question.explanation}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🚀 Next Question',
              emoji: true
            },
            action_id: 'action_next_quiz',
            style: 'primary'
          }
        ]
      }
    ];

    await respond({
      response_type: 'in_channel',
      blocks: resultBlocks
    });
  } catch (error) {
    console.error('Error handling quiz answer:', error);
  }
}
