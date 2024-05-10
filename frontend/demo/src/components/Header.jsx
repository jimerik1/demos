import React from 'react';
import { TopBar, Badge, Button, IconType } from '@oliasoft-open-source/react-ui-library';  // Correct import statement for TopBar

function Header() {
    // Handlers for various clickable items in the TopBar
    const handleTitleClick = () => {
        console.log("Title clicked");
    };

    const handleAppSwitcherClick = () => {
        console.log("App switcher clicked");
    };

    const handleHomeClick = () => {
        console.log("Home clicked");
    };

    const handleAboutClick = () => {
        console.log("About clicked");
    };

    const handleProfileClick = () => {
        console.log("Profile clicked");
    };

    const handleSettingsClick = () => {
        console.log("Settings clicked");
    };

    return (
<TopBar title={{
  onClick: () => {}
}} content={[{
  type: 'Link',
  label: 'Demo',
  active: true,
  onClick: () => {}
}, {
  type: 'Link',
  label: 'JSFiddle',
  onClick: () => {}
}, {
  type: 'Link',
  label: 'Blog Post',
  disabled: true,
  onClick: () => {}
}
]} contentRight={[{
  type: 'Component',
  component: <Badge title="3" small margin="5px">
            <Button icon={IconType.NOTIFICATION} round onClick={() => {}} />
          </Badge>
}]} />

    );
}

export default Header;
