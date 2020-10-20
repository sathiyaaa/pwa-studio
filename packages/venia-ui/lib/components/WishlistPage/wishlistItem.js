import React, { useEffect } from 'react';
import { MoreHorizontal } from 'react-feather';
import { useIntl } from 'react-intl';
import { Price, useToasts } from '@magento/peregrine';
import { useWishlistItem } from '@magento/peregrine/lib/talons/WishlistPage/useWishlistItem';

import { mergeClasses } from '../../classify';
import Dialog from '../Dialog';
import Icon from '../Icon';
import Image from '../Image';
import WishlistItemActions from './wishlistItemActions';
import defaultClasses from './wishlistItem.css';
import wishlistItemOperations from './wishlistItem.gql';

const WishlistItem = props => {
    const { item, wishlistId } = props;

    const {
        child_sku: childSku,
        configurable_options: configurableOptions = [],
        id: itemId,
        product
    } = item;
    const { image, name, price_range: priceRange, sku } = product;

    const { label: imageLabel, url } = image;

    const { maximum_price: maximumPrice } = priceRange;
    const { final_price: finalPrice } = maximumPrice;
    const { currency, value: unitPrice } = finalPrice;

    const talonProps = useWishlistItem({
        childSku,
        itemId,
        sku,
        wishlistId,
        ...wishlistItemOperations
    });
    const {
        actionsDialogIsOpen,
        handleAddToCart,
        handleCloseActionsDialog,
        handleMoreActions,
        handleRemove,
        hasError,
        isLoading
    } = talonProps;

    const { formatMessage } = useIntl();
    const [, { addToast }] = useToasts();

    useEffect(() => {
        if (hasError) {
            addToast({
                type: 'error',
                message: formatMessage({
                    id: 'wishlistItem.addToCartError',
                    defaultMessage:
                        'Something went wrong. Please refresh and try again.'
                }),
                timeout: 5000
            });
        }
    }, [addToast, formatMessage, hasError]);

    const classes = mergeClasses(defaultClasses, props.classes);

    const optionElements = configurableOptions.map(option => {
        const {
            id,
            option_label: optionLabel,
            value_label: valueLabel
        } = option;

        return (
            <span
                className={classes.option}
                key={id}
            >{`${optionLabel} : ${valueLabel}`}</span>
        );
    });

    return (
        <div className={classes.root}>
            <Image
                alt={imageLabel}
                classes={{ image: classes.image }}
                src={url}
                width={400}
            />
            <span className={classes.name}>{name}</span>
            {optionElements}
            <div className={classes.priceContainer}>
                <Price currencyCode={currency} value={unitPrice} />
            </div>
            <div className={classes.actionsContainer}>
                <button
                    className={classes.addToCart}
                    disabled={isLoading}
                    onClick={handleAddToCart}
                >
                    {formatMessage({
                        id: 'wishlistItem.addToCart',
                        defaultMessage: 'Add to Cart'
                    })}
                </button>
                <button
                    className={classes.moreActions}
                    onClick={handleMoreActions}
                >
                    <Icon size={16} src={MoreHorizontal} />
                </button>
                {/* The more actions Dialog. */}
                <Dialog
                    isOpen={actionsDialogIsOpen}
                    onCancel={handleCloseActionsDialog}
                    shouldShowButtons={false}
                    title={formatMessage({
                        id: 'wishlistItemActions.title',
                        defaultMessage: 'Actions'
                    })}
                >
                    <WishlistItemActions onRemove={handleRemove} />
                </Dialog>
            </div>
        </div>
    );
};

export default WishlistItem;
