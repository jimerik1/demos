import React from 'react';
import { SideBar, Icon} from '@oliasoft-open-source/react-ui-library';
import { useHistory } from 'react-router-dom';

function Nav() {
    const history = useHistory();

    // Navigation handlers
    const navigateTo = (path) => {
        history.push(path);
    };

    return (
        <SideBar // Make sure the case matches the imported name
            options={{
                title: 'Navigation',
                sections: [
                    {
                        heading: 'Demos',
                        items: [
                            { label: 'Test API', value: 'item1', icon: <Icon icon="key" size={20}/>, onClick: () => navigateTo('/') },
                            { label: 'AI Tables', value: 'item2', icon: <Icon icon="star" size={20}/>, onClick: () => navigateTo('/main2') },
                            { label: 'Automated Reports', value: 'item3', icon: <Icon icon="star" size={20}/>, onClick: () => navigateTo('/main3') },
                            { label: 'Placeholder', value: 'item4', icon: <Icon icon="star" size={20}/>, onClick: () => navigateTo('/main4') },

                        ]
                    },
                    {
                        heading: 'Oher Projects',
                        items: [
                            { label: 'Item 3', value: 'item3', icon:  <Icon icon="star" size={20}/>, onClick: () => navigateTo('/path3') },
                            { label: 'Item 4', value: 'item4', icon:  <Icon icon="star" size={20}/>, onClick: () => navigateTo('/path4') },
                        ]
                    }
                ]
            }}
            startOpen={false}
            onShiftClickToggleOpen={() => console.log("Sidebar toggle via shift-click")}
            top="50px"
        />
    );
}

export default Nav;
