import React, { useState, useRef, useEffect } from 'react';
import { 
    Table, Card, Heading, Icon, Flex, Divider, Button, Grid, Message, Select, 
    Accordion, Text, ProgressBar, Menu, Modal, Dialog, TextArea, List 
} from '@oliasoft-open-source/react-ui-library';

function LibraryTable() {
    //OPEN AI Vector Store ID and Assistant ID. Must setup a separate one on Open AI for each table.
    const VECTOR_STORE_ID = 'vs_vjFY5WAzigvMqjLWo3WGm8rp';
    const ASSISTANT_ID = 'asst_PWDU6iDMlBEtIFPNpbiVHv0Q';
    const TABLETYPE = "BHA";


    return (
        <div>

                    <Grid columns="1fr 3fr 1fr">
                    <List bordered
  list={{
    actions: [
      {
        label: 'More',
        subActions: [
          {
            icon: 'up',
            label: 'Item',
            onClick: function Ba(){}
          },
          {
            icon: 'down',
            label: 'Item',
            onClick: function Ba(){}
          }
        ]
      },
      {
        icon: 'add',
        label: 'Add',
        onClick: function Ba(){},
        primary: true
      }
    ],
    items: [
      {
        id: 1,
        name: <Flex alignItems="center" gap="var(--padding-xs)">Aardvark<Icon icon="star" /></Flex>
      },
      {
        active: true,
        id: 2,
        name: <Flex alignItems="center" gap="var(--padding-xs)">Kangaroo<Icon icon="star" /></Flex>
      },
      {
        disabled: true,
        id: 3,
        name: <Flex alignItems="center" gap="var(--padding-xs)">Jaguar<Icon icon="star" /></Flex>
      }
    ],
    name: <Flex alignItems="center" gap="var(--padding-xs)">Connections<Icon icon="star" /></Flex>
  }}
/>


                <Card>
                Item 2
                </Card>
                <Card>
                Item 3
                </Card>

            </Grid>


        </div>
    );
}

export default LibraryTable;
