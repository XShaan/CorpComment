// -- GLOBAL --
const MAX_CHARS = 150;
const BASE_API = 'https://bytegrad.com/course-assets/js/1/api'

const textareaEl = document.querySelector('.form__textarea')
const counterEl = document.querySelector('.counter')
const formEl = document.querySelector('.form')
const feedbackListEl = document.querySelector('.feedbacks')
const submitBtnEl = document.querySelector('.submit-btn')
const spinnerEl = document.querySelector('.spinner')
const hashtagListEl = document.querySelector('.hashtags')


const renderFeedbackItem = (feedbackItem) => {
    const feedbackItemHTML = `
                <li class="feedback">
                    <button class="upvote">
                        <i class="fa-solid fa-caret-up upvote__icon"></i>
                        <span class="upvote__count">${feedbackItem.upvoteCount}</span>
                    </button>
                    <section class="feedback__badge">
                        <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
                    </section>
                    <div class="feedback__content">
                        <p class="feedback__company">${feedbackItem.company}</p>
                        <p class="feedback__text">${feedbackItem.text}</p>
                    </div>
                    <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
                </li>
                `;

    feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHTML);
}

// -- COUNTER COMPONENT --
const inputHandler = (event) => {
    const maxNrChars = MAX_CHARS;
    const nrCharsTyped = textareaEl.value.length
    const charsLeft = maxNrChars - nrCharsTyped

    counterEl.textContent = charsLeft
    console.log(nrCharsTyped);
}
textareaEl.addEventListener('input', inputHandler)

// -- FORM COMPONENT --


const showVisualIndicator = textCheck => {
    const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';
    // show valid indicator
    formEl.classList.add(className)

    setTimeout(() => {
        formEl.classList.remove(className)
    }, 2000)

}

const submitHandler = (event) => {
    event.preventDefault();

    const text = textareaEl.value;

    if (text.includes('#') && text.length >= 5) {
        showVisualIndicator('valid');
    } else {
        showVisualIndicator('invalid');

        // focus textarea
        textareaEl.focus();

        //stop this function execution
        return;

    }
    const hashtag = text.split(' ').find(word => word.includes('#'))
    const company = hashtag.substring(1)
    const badgeLetter = company.substring(0, 1).toUpperCase()
    const upvoteCount = 0;
    const daysAgo = 0;

    //create feedback item object
    const feedbackItem = {
        upvoteCount: upvoteCount,
        company: company,
        badgeLetter: badgeLetter,
        daysAgo: daysAgo,
        text: text
    }

    // render feedback item
    renderFeedbackItem(feedbackItem)

    // send feedback item to server
    fetch(`${BASE_API}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(feedbackItem),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => {
        if (!res.ok) {
            console.log('Something went wrong');
            return
        }
        console.log('Successfully submitted')
    }).catch(err => console.log(err));

    textareaEl.value = '';
    submitBtnEl.blur();
    counterEl.textContent = MAX_CHARS;


}

formEl.addEventListener('submit', submitHandler)


// -- FEEDBACK LIST COMPONENT

const clickHandler = event => {
    //get clicked HTML-element
    const clickedEl = event.target

    const upvoteIntention = clickedEl.className.includes('upvote')


    if (upvoteIntention) {
        const upvoteBtnEl = clickedEl.closest('.upvote')
        upvoteBtnEl.disabled = true

        const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count')

        let upvoteCount = +upvoteCountEl.textContent;

        upvoteCountEl.textContent = ++upvoteCount;

    } else {
        // expand the clicked feedback item
        clickedEl.closest('.feedback').classList.toggle('feedback--expand')
    }
}

feedbackListEl.addEventListener('click', clickHandler)

fetch(`${BASE_API}/feedbacks`)
    .then(res => res.json())
    .then(data => {

        //remove spinner
        spinnerEl.remove()
        data.feedbacks.forEach(feedbackItem => renderFeedbackItem(feedbackItem));

    })
    .catch(err => {
        feedbackListEl.textContent = `Error Message: ${err.message}`;
    });


// -- HASHTAG LIST COMPONENT --
const clickHandler2 = event => {
    const clickedEl = event.target;

    if (clickedEl.className === 'hashtags') return;

    const companyNameFromHashtag = clickedEl.textContent.substring(1).toLowerCase().trim()

    feedbackListEl.childNodes.forEach(childNode => {
        if (childNode.nodeType === 3) return;

        const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim();

        if (companyNameFromHashtag !== companyNameFromFeedbackItem) {
            childNode.remove()
        }

    });

}

hashtagListEl.addEventListener('click', clickHandler2)


