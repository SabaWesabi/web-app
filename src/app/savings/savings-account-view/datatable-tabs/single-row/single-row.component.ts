/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from '../../../../shared/delete-dialog/delete-dialog.component';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';

/** Custom Services */
import { SavingsService } from '../../../savings.service';
import { Dates } from 'app/core/utils/dates';
import { Datatables } from 'app/core/utils/datatables';


/**
 * Savings Account Single Row Data Tables
 */
@Component({
  selector: 'mifosx-single-row',
  templateUrl: './single-row.component.html',
  styleUrls: ['./single-row.component.scss']
})
export class SingleRowComponent implements OnInit {

  /** Data Object */
  @Input() dataObject: any;

  /** Data Table Name */
  datatableName: string;
  /** Savings Id */
  savingAccountId: string;

  /**
   * Fetches savings account Id from parent route params.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {SavingsService} savingsService Savingss Service.
   * @param {MatDialog} dialog Mat Dialog.
   * @param {SettingsService} settingsService Setting service
   * @param {Datatables} datatables Datatable utils
   */
  constructor(private route: ActivatedRoute,
              private dateUtils: Dates,
              private dialog: MatDialog,
              private savingsService: SavingsService,
              private settingsService: SettingsService,
              private datatables: Datatables) {
    this.savingAccountId = this.route.parent.parent.snapshot.paramMap.get('savingAccountId');
  }

  /**
   * Fetches data table name from route params.
   * subscription is required due to asynchronicity.
   */
  ngOnInit() {
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
    });
  }

  /**
   * Creates a new instance of the given single row data table.
   */
  add() {
    let dataTableEntryObject: any = { locale: this.settingsService.language.code };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'savings_account_id'));
    });
    const formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    const data = {
      title: 'Add ' + this.datatableName,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.savingsService.addSavingsDatatableEntry(this.savingAccountId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.savingsService.getSavingsDatatable(this.savingAccountId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
          });
        });
      }
    });
  }

  /**
   * Edits the current instance of single row data table.
   */
  edit() {
    let dataTableEntryObject: any = { locale: this.settingsService.language.code };
    const dateTransformColumns: string[] = [];
    const columns = this.dataObject.columnHeaders.filter((column: any) => {
      return ((column.columnName !== 'id') && (column.columnName !== 'savings_account_id') && (column.columnName !== 'created_at') && (column.columnName !== 'updated_at'));
    });
    let formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    formfields = formfields.map((formfield: FormfieldBase, index: number) => {
      formfield.value = (this.dataObject.data[0].row[index + 1]) ? this.dataObject.data[0].row[index + 1] : '';
      return formfield;
    });
    const data = {
      title: 'Edit ' + this.datatableName,
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editDialogRef = this.dialog.open(FormDialogComponent, { data });
    editDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.savingsService.editSavingsDatatableEntry(this.savingAccountId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.savingsService.getSavingsDatatable(this.savingAccountId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
          });
        });
      }
    });
  }

  /**
   * Deletes the current instance of single row data table.
   */
  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the contents of ${this.datatableName}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.savingsService.deleteDatatableContent(this.savingAccountId, this.datatableName)
          .subscribe(() => {
            this.savingsService.getSavingsDatatable(this.savingAccountId, this.datatableName).subscribe((dataObject: any) => {
              this.dataObject = dataObject;
            });
          });
      }
    });
  }

}
