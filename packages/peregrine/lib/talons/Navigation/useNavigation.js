import { useCallback, useEffect, useState } from 'react';

import { useAppContext } from '../../context/app';
import { useCatalogContext } from '../../context/catalog';
import { useUserContext } from '../../context/user';
import { useAwaitQuery } from '../../hooks/useAwaitQuery';
import DEFAULT_OPERATIONS from './navigation.gql';

const ancestors = {
    CREATE_ACCOUNT: 'SIGN_IN',
    FORGOT_PASSWORD: 'SIGN_IN',
    MY_ACCOUNT: 'MENU',
    SIGN_IN: 'MENU',
    MENU: null
};

export const useNavigation = (props = {}) => {
    const { operations = DEFAULT_OPERATIONS } = props;
    const { getCustomerQuery } = operations;
    // retrieve app state from context
    const [appState, { closeDrawer }] = useAppContext();
    const [catalogState, { actions: catalogActions }] = useCatalogContext();
    const [, { getUserDetails }] = useUserContext();
    const fetchUserDetails = useAwaitQuery(getCustomerQuery);

    // request data from server
    useEffect(() => {
        getUserDetails({ fetchUserDetails });
    }, [fetchUserDetails, getUserDetails]);

    // extract relevant data from app state
    const { drawer } = appState;
    const isOpen = drawer === 'nav';
    const { categories, rootCategoryId } = catalogState;

    // get local state
    const [view, setView] = useState('MENU');
    const [categoryId, setCategoryId] = useState(rootCategoryId);

    // define local variables
    const category = categories[categoryId];
    const isTopLevel = categoryId === rootCategoryId;
    const hasModal = view !== 'MENU';

    // define handlers
    const handleBack = useCallback(() => {
        const parent = ancestors[view];

        if (parent) {
            setView(parent);
        } else if (category && !isTopLevel) {
            setCategoryId(category.parentId);
        } else {
            closeDrawer();
        }
    }, [category, closeDrawer, isTopLevel, view]);

    const handleClose = useCallback(() => {
        closeDrawer();
    }, [closeDrawer]);

    // create callbacks for local state
    const showCreateAccount = useCallback(() => {
        setView('CREATE_ACCOUNT');
    }, [setView]);
    const showForgotPassword = useCallback(() => {
        setView('FORGOT_PASSWORD');
    }, [setView]);
    const showMainMenu = useCallback(() => {
        setView('MENU');
    }, [setView]);
    const showMyAccount = useCallback(() => {
        setView('MY_ACCOUNT');
    }, [setView]);
    const showSignIn = useCallback(() => {
        setView('SIGN_IN');
    }, [setView]);

    return {
        catalogActions,
        categoryId,
        handleBack,
        handleClose,
        hasModal,
        isOpen,
        isTopLevel,
        setCategoryId,
        showCreateAccount,
        showForgotPassword,
        showMainMenu,
        showMyAccount,
        showSignIn,
        view
    };
};
