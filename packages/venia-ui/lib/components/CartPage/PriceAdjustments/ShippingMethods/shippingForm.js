import React, { Fragment } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { gql } from '@apollo/client';
import { Form } from 'informed';
import { func, shape, string } from 'prop-types';
import { useShippingForm } from '@magento/peregrine/lib/talons/CartPage/PriceAdjustments/ShippingMethods/useShippingForm';

import { mergeClasses } from '../../../../classify';
import { isRequired } from '../../../../util/formValidators';
import Button from '../../../Button';
import { ShippingInformationFragment } from '../../../CheckoutPage/ShippingInformation/shippingInformationFragments.gql';
import Country from '../../../Country';
import Field from '../../../Field';
import FormError from '../../../FormError';
import Region from '../../../Region';
import TextInput from '../../../TextInput';
import { CartPageFragment } from '../../cartPageFragments.gql';
import defaultClasses from './shippingForm.css';
import { GET_SHIPPING_METHODS } from './shippingMethods.gql';
import { ShippingMethodsCartFragment } from './shippingMethodsFragments.gql';

const ShippingForm = props => {
    const { hasMethods, selectedShippingFields, setIsCartUpdating } = props;
    const talonProps = useShippingForm({
        selectedValues: selectedShippingFields,
        setIsCartUpdating,
        mutations: {
            setShippingAddressMutation: SET_SHIPPING_ADDRESS_MUTATION
        },
        queries: {
            shippingMethodsQuery: GET_SHIPPING_METHODS
        }
    });
    const {
        errors,
        handleOnSubmit,
        handleZipChange,
        isSetShippingLoading
    } = talonProps;
    const { formatMessage } = useIntl();

    const classes = mergeClasses(defaultClasses, props.classes);

    const shippingStatusMessage = isSetShippingLoading
        ? formatMessage({
              id: 'shippingForm.loading',
              defaultMessage: 'Loading Methods...'
          })
        : formatMessage({
              id: 'shippingForm.getShippingOptions',
              defaultMessage: 'Get Shipping Options'
          });

    return (
        <Fragment>
            <h3 className={classes.formTitle}>
                <FormattedMessage
                    id={'shippingForm.formTitle'}
                    defaultMessage={'Destination'}
                />
            </h3>
            <FormError errors={Array.from(errors.values)} />
            <Form
                className={classes.root}
                initialValues={selectedShippingFields}
                onSubmit={handleOnSubmit}
            >
                <Country validate={isRequired} />
                <Region validate={isRequired} />
                <Field
                    id="zip"
                    label={formatMessage({
                        id: 'shippingForm.zip',
                        defaultMessage: 'ZIP'
                    })}
                    classes={{
                        root: classes.zip
                    }}
                >
                    <TextInput
                        field="zip"
                        validate={isRequired}
                        onValueChange={handleZipChange}
                    />
                </Field>
                {!hasMethods ? (
                    <Button
                        classes={{
                            root_normalPriority: classes.submit
                        }}
                        disabled={isSetShippingLoading}
                        priority="normal"
                        type="submit"
                    >
                        {shippingStatusMessage}
                    </Button>
                ) : null}
            </Form>
        </Fragment>
    );
};

export default ShippingForm;

ShippingForm.propTypes = {
    classes: shape({
        zip: string
    }),
    selectedShippingFields: shape({
        country: string.isRequired,
        region: string.isRequired,
        zip: string.isRequired
    }),
    setIsFetchingMethods: func
};

export const SET_SHIPPING_ADDRESS_MUTATION = gql`
    mutation SetShippingAddressForEstimate(
        $cartId: String!
        $address: CartAddressInput!
    ) {
        setShippingAddressesOnCart(
            input: {
                cart_id: $cartId
                shipping_addresses: [{ address: $address }]
            }
        ) @connection(key: "setShippingAddressesOnCart") {
            cart {
                id
                ...CartPageFragment
                ...ShippingMethodsCartFragment
                ...ShippingInformationFragment
            }
        }
    }
    ${CartPageFragment}
    ${ShippingMethodsCartFragment}
    ${ShippingInformationFragment}
`;
