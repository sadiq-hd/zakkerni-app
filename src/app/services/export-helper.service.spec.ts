import { TestBed } from '@angular/core/testing';

import { ExportHelperService } from './export-helper.service';

describe('ExportHelperService', () => {
  let service: ExportHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
