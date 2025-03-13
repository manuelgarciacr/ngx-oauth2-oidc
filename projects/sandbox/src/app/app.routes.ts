import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: "foo",
        children: [
            {path: "foo"}
        ]
    }
];
