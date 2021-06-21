import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { PrintConfigComponent } from "./pages/print-config/print-config.component";
import { PrintLabelComponent } from "./pages/print-label/print-label.component";
import { DasboardComponent } from "./main/dasboard/dasboard.component";
import {AuthGuard} from "./_helpers/auth.guard";
import { PriceUpdateComponent } from './pages/price-update/price-update.component';

const routes: Routes = [
	{ path: "login", component: LoginComponent },
	{
		path: "",
		component: DasboardComponent,
		canActivate: [AuthGuard],
		children: [

			{ path: "user", component: LoginComponent ,canActivate: [AuthGuard]},
			{ path: "", component: PrintLabelComponent ,canActivate: [AuthGuard]},
			{ path: "print-config", component: PrintConfigComponent ,canActivate: [AuthGuard]},
			{ path: "label", component: PrintLabelComponent ,canActivate: [AuthGuard]},
			{ path: "prices", component: PriceUpdateComponent ,canActivate: [AuthGuard]},
		],
	},
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {}
