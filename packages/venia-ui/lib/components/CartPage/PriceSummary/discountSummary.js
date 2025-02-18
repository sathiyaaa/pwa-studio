import React, { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { gql } from '@apollo/client';
import Price from '@magento/venia-ui/lib/components/Price';

import { mergeClasses } from '../../../classify';

const DEFAULT_AMOUNT = {
    currency: 'USD',
    value: 0
};

/**
 * Reduces discounts array into a single amount.
 *
 * @param {Array} discounts
 */
const getDiscount = (discounts = []) => {
    // discounts from data can be null
    if (!discounts || !discounts.length) {
        return DEFAULT_AMOUNT;
    } else {
        return {
            currency: discounts[0].amount.currency,
            value: discounts.reduce(
                (acc, discount) => acc + discount.amount.value,
                0
            )
        };
    }
};

/**
 * A component that renders the discount summary line item.
 *
 * @param {Object} props.classes
 * @param {Object} props.data fragment response data
 */
const DiscountSummary = props => {
    const classes = mergeClasses({}, props.classes);
    const discount = getDiscount(props.data);

    return discount.value ? (
        <Fragment>
            <span className={classes.lineItemLabel}>
                <FormattedMessage
                    id={'discountSummary.lineItemLabel'}
                    defaultMessage={'Discounts applied'}
                />
            </span>
            <span className={classes.price}>
                {'-'}
                <Price
                    value={discount.value}
                    currencyCode={discount.currency}
                />
            </span>
        </Fragment>
    ) : null;
};

export const DiscountSummaryFragment = gql`
    fragment DiscountSummaryFragment on CartPrices {
        discounts {
            amount {
                currency
                value
            }
            label
        }
    }
`;

export default DiscountSummary;
