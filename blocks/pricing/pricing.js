function getCellText(cell) {
  return cell.textContent.trim().replace(/\s+/g, ' ').toLowerCase();
}

function isBillingToggle(row) {
  const cells = [...row.children];
  return cells.length === 2
    && getCellText(cells[0]) === 'monthly'
    && getCellText(cells[1]) === 'yearly';
}

function decorateBillingToggle(row) {
  const toggle = document.createElement('div');
  toggle.className = 'pricing-toggle';
  toggle.setAttribute('role', 'group');
  toggle.setAttribute('aria-label', 'Billing period');

  [...row.children].forEach((cell, index) => {
    const option = document.createElement('span');
    option.className = 'pricing-toggle-option';
    option.textContent = cell.textContent.trim();
    if (index === 0) option.setAttribute('aria-current', 'true');
    toggle.append(option);
  });

  return toggle;
}

function decoratePlan(row) {
  const cells = [...row.children];
  const titleText = cells[0]?.textContent.trim();
  const priceText = cells[1]?.textContent.trim();
  if (!titleText || !priceText) {
    // eslint-disable-next-line no-console
    console.warn('Pricing plan skipped: each plan needs a non-empty title and price.');
    return null;
  }
  if (cells.length > 4) {
    // eslint-disable-next-line no-console
    console.warn('Pricing plan has more than four cells; extra cells are ignored.');
  }

  const plan = document.createElement('article');
  plan.className = 'pricing-plan';
  plan.setAttribute('aria-label', titleText);

  const title = document.createElement('div');
  title.className = 'pricing-plan-title';
  title.append(...cells[0].childNodes);
  plan.append(title);

  const price = document.createElement('div');
  price.className = 'pricing-plan-price';
  const priceContent = cells[1].querySelector('p') || cells[1];
  price.append(...priceContent.childNodes);
  const amount = price.querySelector('strong');
  if (amount) {
    const { previousElementSibling } = amount;
    if (!previousElementSibling || previousElementSibling.tagName !== 'SMALL') {
      const currency = document.createElement('small');
      let { previousSibling } = amount;
      while (previousSibling) {
        const { previousSibling: nextSibling } = previousSibling;
        currency.prepend(previousSibling);
        previousSibling = nextSibling;
      }
      const { textContent } = currency;
      if (textContent.trim()) amount.before(currency);
    }

    const period = document.createElement('span');
    let { nextSibling: sibling } = amount;
    while (sibling) {
      const { nextSibling } = sibling;
      period.append(sibling);
      sibling = nextSibling;
    }
    const { textContent } = period;
    if (textContent.trim()) amount.after(period);
  }
  plan.append(price);

  if (cells[2]) {
    const features = document.createElement('div');
    features.className = 'pricing-plan-features';
    features.append(...cells[2].childNodes);
    plan.append(features);
  }

  if (cells[3]) {
    const action = document.createElement('div');
    action.className = 'pricing-plan-action';
    const link = cells[3].querySelector('a');
    if (link) {
      link.classList.add('pricing-action-link');
      action.append(link);
    } else if (cells[3].textContent.trim()) {
      const label = document.createElement('span');
      label.className = 'pricing-action-label';
      label.textContent = cells[3].textContent.trim();
      action.append(label);
    }
    plan.append(action);
  }

  return plan;
}

/**
 * Decorates a billing-period label and a collection of pricing plans.
 * @param {Element} block The pricing block.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const toggleRow = rows.find(isBillingToggle);
  const planRows = rows.filter((row) => row !== toggleRow);
  const plans = planRows.map(decoratePlan).filter(Boolean);

  if (!plans.length) {
    // eslint-disable-next-line no-console
    console.warn('Pricing block not decorated: add at least one plan with a title and price.');
    return;
  }

  if (plans.length === 3) plans[1].classList.add('is-featured');

  const planList = document.createElement('div');
  planList.className = 'pricing-plans';
  planList.append(...plans);

  block.replaceChildren(
    ...(toggleRow ? [decorateBillingToggle(toggleRow), planList] : [planList]),
  );
}
